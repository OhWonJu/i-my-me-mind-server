import { api, APIError, Header } from "encore.dev/api";
import UsersService from "./users.service";
import { getAuthData } from "~encore/auth";
import { CommonResponse } from "../../types/commonResponse";
import { CurrentUserResponse } from "./users.interface";
import { prisma } from "../../database";
import cookie from "cookie";

export const getImmmdKey = api(
  { expose: true, method: "GET", path: "/users/immmdkey", auth: false },
  async ({
    cookies,
  }: {
    cookies?: Header<"Cookie">;
  }): Promise<{ immmdKey: number | null }> => {
    if (!cookies) return { immmdKey: null };

    const {
      immmd_access_token: accessToken,
      immmd_refresh_token: refreshToken,
    } = cookie.parse(cookies);

    if (!accessToken || !refreshToken) return { immmdKey: null };
    else {
      const data = getAuthData();
      return { immmdKey: data?.exp ?? null };
    }
  }
);

export const getCurrentUser = api(
  { expose: true, method: "GET", path: "/users/current", auth: true },
  async (): Promise<CommonResponse<CurrentUserResponse>> => {
    const data = getAuthData();

    const user = await prisma.user.findUnique({
      where: {
        id: data?.userID,
      },
    });

    if (user)
      return {
        ok: true,
        data: {
          email: user.email!,
          id: user.id,
          name: user.name!,
        },
      };

    return { ok: false };
  }
);

export const token = api(
  { expose: true, method: "GET", path: "/users/token", auth: true },
  async (): Promise<{ success: boolean; result: any }> => {
    try {
      const result = await UsersService.count();
      return { success: true, result };
    } catch (error) {
      throw APIError.aborted(
        error?.toString() || "Error counting existing users"
      );
    }
  }
);
