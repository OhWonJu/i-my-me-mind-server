export interface CreateAccountDTO {
  readonly type: string;
  readonly provider: string;
  readonly providerAccountId: string;
  readonly refresh_token?: string;
  readonly access_token?: string;
  readonly expires_at?: number;
  readonly token_type?: string;
  readonly scope?: string;
  readonly id_token?: string;
  readonly session_state?: string;
  readonly userId: string;
}
