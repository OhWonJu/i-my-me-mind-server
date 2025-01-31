export interface CreateUserDTO {
  readonly name?: string;
  readonly email: string;
}

export interface UpdateUserDTO {
  name?: string;
}

export interface UpdateUserResponse {
  name: string | null;
  email: string | null;
  updatedAt: Date;
}

export interface CurrentUserResponse {
  id: string;
  name: string;
  email: string;
}
