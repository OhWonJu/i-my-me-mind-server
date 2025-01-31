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
import { UNAUTHORIZED } from "../lib/errorCodes";

export const auth = api<OAuhtAccount, AuthResponse>(
  { expose: true, method: "POST", path: "/auth/v1/oauth" },
  async (data: OAuhtAccount) => {
    try {
      const { isLogin, accessToken, expiresAt, refreshToken } =
        await AuthService.authentication(data);

      if (isLogin && accessToken && refreshToken && expiresAt) {
        return {
          immmd_key: expiresAt,
          immmd_access_token: cookie.serialize(
            "immmd_access_token",
            accessToken,
            { httpOnly: true, path: "/" }
          ),
          immmd_refresh_token: cookie.serialize(
            "immmd_refresh_token",
            refreshToken,
            { maxAge: 3600 * 24, httpOnly: true, path: "/" }
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
  },
  async ({ cookies }) => {
    const {
      immmd_access_token: accessToken,
      immmd_refresh_token: refreshToken,
    } = cookie.parse(cookies);

    if (!accessToken || !refreshToken)
      throw APIError.unauthenticated("bad credentials");

    const { ok, data, errorCode, errorMessage } =
      await AuthService.refreshToken({ accessToken, refreshToken });

    if (ok && data) {
      return {
        ok: true,
        immmd_key: data.expiresAt,
        immmd_access_token: cookie.serialize(
          "immmd_access_token",
          data.accessToken,
          { httpOnly: true, path: "/" }
        ),
      };
    } else {
      return {
        ok: false,
        errorCode,
        errorMessage,
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

    if (!data)
      return {
        ok: false,
        errorMessage: UNAUTHORIZED.NOT_AUTHORIZED.message,
        errorCode: UNAUTHORIZED.NOT_AUTHORIZED.code,
      };

    return {
      ok: true,
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
);
