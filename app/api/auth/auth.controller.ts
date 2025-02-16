import { api, APIError } from "encore.dev/api";
import cookie from "cookie";
import {
  AuthParams,
  AuthResponse,
  OAuhtAccount,
  ReAuthResponse,
} from "./auth.interface";
import AuthService from "./auth.service";
import { getAuthData } from "~encore/auth";
import { UNAUTHORIZED } from "../../lib/errorCodes";

const TOKEN_MAX_AGE = 3600 * 24 * 30 - 60; // 30Days - 1Min

export const auth = api<OAuhtAccount, AuthResponse>(
  { expose: true, method: "POST", path: "/auth/v1/oauth" },
  async (data: OAuhtAccount) => {
    try {
      const { isLogin, accessToken, expiresAt, refreshToken } =
        await AuthService.authentication(data);

      if (isLogin && accessToken && refreshToken && expiresAt) {
        return {
          immmd_key: cookie.serialize("immmd_key", expiresAt.toString(), {
            maxAge: TOKEN_MAX_AGE,
            path: "/",
          }),
          immmd_access_token: cookie.serialize(
            "immmd_access_token",
            accessToken,
            { maxAge: TOKEN_MAX_AGE, httpOnly: true, path: "/" }
          ),
          immmd_refresh_token: cookie.serialize(
            "immmd_refresh_token",
            refreshToken,
            { maxAge: TOKEN_MAX_AGE, httpOnly: true, path: "/" }
          ),
        };
      } else {
        throw APIError.aborted("failed user varification");
      }
    } catch (error) {
      throw error;
    }
  }
);

export const refreshToken = api<AuthParams, ReAuthResponse>(
  {
    expose: true,
    method: "POST",
    path: "/auth/v1/refresh",
    auth: true,
  },
  async ({ cookies }) => {
    const { immmd_refresh_token: refreshToken } = cookie.parse(cookies);

    if (!refreshToken) throw APIError.unauthenticated("bad credentials");

    const { ok, data, errorCode, errorMessage } =
      await AuthService.refreshToken({ refreshToken });

    if (ok && data) {
      return {
        ok: true,
        immmd_key: cookie.serialize("immmd_key", data.expiresAt.toString(), {
          maxAge: TOKEN_MAX_AGE,
          path: "/",
        }),
        immmd_access_token: cookie.serialize(
          "immmd_access_token",
          data.accessToken,
          { maxAge: TOKEN_MAX_AGE, httpOnly: true, path: "/" }
        ),
      };
    } else {
      return {
        ok: false,
        errorCode,
        errorMessage,
        immmd_key: cookie.serialize("immmd_key", "", {
          maxAge: 0,
          path: "/",
        }),
        immmd_access_token: cookie.serialize("immmd_access_token", "", {
          maxAge: 0,
          httpOnly: true,
          path: "/",
        }),
        immmd_refresh_token: cookie.serialize("immmd_refresh_token", "", {
          maxAge: 0,
          httpOnly: true,
          path: "/",
        }),
      };
    }
  }
);

export const logout = api(
  { expose: true, method: "POST", path: "/auth/logout" },
  async (): Promise<ReAuthResponse> => {
    const data = getAuthData();

    let res = null;

    if (!data)
      res = {
        ok: false,
        errorMessage: UNAUTHORIZED.NOT_AUTHORIZED.message,
        errorCode: UNAUTHORIZED.NOT_AUTHORIZED.code,
      };
    else
      res = {
        ok: true,
      };

    res = {
      ...res,
      immmd_access_token: cookie.serialize("immmd_access_token", "", {
        maxAge: 0,
        httpOnly: true,
        path: "/",
      }),
      immmd_refresh_token: cookie.serialize("immmd_refresh_token", "", {
        maxAge: 0,
        httpOnly: true,
        path: "/",
      }),
    };

    return res;
  }
);
