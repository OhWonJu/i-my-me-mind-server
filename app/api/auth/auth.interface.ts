import { Header } from "encore.dev/api";
import { JwtPayload } from "jsonwebtoken";

export interface AuthParams {
  cookies: Header<"Cookie">;
}

export interface OAuhtAccount {
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  email?: string;
  name?: string;
}

export interface AuthResponse {
  immmd_key?: Header<"Set-cookie">;
  immmd_access_token?: Header<"Set-cookie">;
  immmd_refresh_token?: Header<"Set-cookie">;
}

export interface ReAuthResponse extends AuthResponse {
  ok: boolean;
  errorCode?: number;
  errorMessage?: string;
}

export interface RefreshTokenDTO {
  readonly refreshToken: string;
}

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  accountKey: string;
}
