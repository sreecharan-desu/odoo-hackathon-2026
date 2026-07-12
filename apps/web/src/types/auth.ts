export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  driver_id?: number | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type?: string;
  user: AuthUser;
};
