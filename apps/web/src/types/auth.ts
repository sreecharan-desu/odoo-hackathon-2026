export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  roleOverride?: string;
};

export type LoginResponse = {
  access_token: string;
  token_type?: string;
  user: AuthUser;
};
