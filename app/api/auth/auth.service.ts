import { APIError, ErrCode } from "encore.dev/api";
import {
  AccessTokenPayload,
  OAuhtAccount,
  RefreshTokenDTO,
  RefreshTokenPayload,
} from "./auth.interface";
import jwt from "jsonwebtoken";
import { CommonResponse } from "../../types/commonResponse";
import { UNAUTHORIZED } from "../../lib/errorCodes";
import UsersService from "../users/users.service";
import AccountsService from "../users/accounts.service";

interface ConnectAccountResult {
  isLogin: boolean;
  accessToken?: string;
  expiresAt?: number;
  refreshToken?: string;
}

const SECRET_KEY = process.env.JWT_SECRET as string;

const AuthService = {
  generateAccessToken: (payload: { userId: string; email: string }) => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "1H" });
  },

  generateRefreshToken: (payload: { userId: string; accountkey: string }) => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "30Days" });
  },

  authentication: async (data: OAuhtAccount): Promise<ConnectAccountResult> => {
    const {
      provider,
      providerAccountId,
      type,
      access_token,
      email,
      id_token,
      name,
      refresh_token,
      scope,
      session_state,
      token_type,
    } = data;

    if (!email) throw new APIError(ErrCode.InvalidArgument, "required email");

    let isLogin = true;

    let user = (await UsersService.findUser({ email })).data ?? null;

    if (!user) {
      user = await UsersService.createUser({
        email,
        name,
      });
    }
    if (!user) {
      isLogin = false;

      return { isLogin };
    }

    let account = await AccountsService.findAccount({
      provider_providerAccountId: {
        provider: data.provider,
        providerAccountId: data.providerAccountId,
      },
    });

    if (!account) {
      account = await AccountsService.createAccount({
        type,
        provider,
        providerAccountId,
        access_token,
        token_type,
        userId: user.id,
        refresh_token,
        scope,
        id_token,
        session_state,
      });
    }
    if (!account) {
      isLogin = false;
      return { isLogin };
    }

    const serviceToken = AuthService.generateAccessToken({
      userId: user.id,
      email: user.email!,
    });
    const serviceRefreshToken = AuthService.generateRefreshToken({
      userId: user.id,
      accountkey: `${account.provider}+${account.providerAccountId}`,
    });

    const parsedAccessToken = jwt.verify(
      serviceToken,
      SECRET_KEY
    ) as AccessTokenPayload;

    account.access_token = serviceToken;
    account.expires_at = parsedAccessToken.exp ?? null;
    account.refresh_token = serviceRefreshToken;

    AccountsService.updateAccount(account);

    return {
      isLogin,
      accessToken: serviceToken,
      expiresAt: parsedAccessToken.exp,
      refreshToken: serviceRefreshToken,
    };
  },

  refreshToken: async (
    refreshTokenDTO: RefreshTokenDTO
  ): Promise<CommonResponse<{ accessToken: string; expiresAt: number }>> => {
    const { refreshToken } = refreshTokenDTO;

    if (!refreshToken)
      return {
        ok: false,
        errorMessage: UNAUTHORIZED.NOT_AUTHORIZED.message,
        errorCode: UNAUTHORIZED.NOT_AUTHORIZED.code,
      };

    const decodedRefreshToken = jwt.verify(
      refreshToken,
      SECRET_KEY
    ) as RefreshTokenPayload;

    const nowTime = Date.now();

    const refreshTokenExpired = decodedRefreshToken.exp! * 1000 - nowTime;

    if (refreshTokenExpired < 0) {
      return {
        ok: false,
        errorMessage: UNAUTHORIZED.REFRESH_TOKEN_EXPIRED.message,
        errorCode: UNAUTHORIZED.REFRESH_TOKEN_EXPIRED.code,
      };
    }

    const userIdByRefreshToken = decodedRefreshToken.userId;

    const { data: userByRefreshToken } = await UsersService.findUser({
      id: userIdByRefreshToken,
    });

    if (!userByRefreshToken) {
      return {
        ok: false,
        errorMessage: UNAUTHORIZED.INVALID_USER.message,
        errorCode: UNAUTHORIZED.INVALID_ACCOUNT.code,
      };
    }

    const [provider, providerAccountId] =
      decodedRefreshToken.accountkey.split("+");

    const account = await AccountsService.findAccount({
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    });

    if (!account) {
      return {
        ok: false,
        errorMessage: UNAUTHORIZED.INVALID_ACCOUNT.message,
        errorCode: UNAUTHORIZED.INVALID_ACCOUNT.code,
      };
    }

    const payload = {
      userId: userByRefreshToken.id!,
      email: userByRefreshToken.email!,
    };
    const newAccessToken = AuthService.generateAccessToken(payload);

    const parsedAccessToken = jwt.verify(
      newAccessToken,
      SECRET_KEY
    ) as AccessTokenPayload;

    account.access_token = newAccessToken;
    account.expires_at = parsedAccessToken.exp!;

    const result = await AccountsService.updateAccount(account);

    if (!result) {
      throw new APIError(ErrCode.Internal, "failed update account");
    }

    return {
      ok: true,
      data: { accessToken: newAccessToken, expiresAt: parsedAccessToken.exp! },
    };
  },
};

export default AuthService;
