export interface CommonResponse<T = any> {
  ok: boolean;
  data?: T;
  errorCode?: number;
  errorMessage?: string;
}
