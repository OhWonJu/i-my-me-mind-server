import { Gateway, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { AccessTokenPayload, AuthParams } from "./auth.interface";

interface AuthData {
  userID: string;
  exp?: number;
  accessToken: string;
}

const SECRET_KEY = process.env.JWT_SECRET as string;

export const auth = authHandler<AuthParams, AuthData>(async ({ cookies }) => {
  const { immmd_access_token: accessToken } = cookie.parse(cookies);

  // if (!accessToken) throw APIError.unauthenticated("bad credentials");

  if (!accessToken) return null;

  const { userId, exp } = jwt.verify(
    accessToken,
    SECRET_KEY
  ) as AccessTokenPayload;

  return { accessToken, userID: userId, exp };
});

export const gateway = new Gateway({
  authHandler: auth,
});
