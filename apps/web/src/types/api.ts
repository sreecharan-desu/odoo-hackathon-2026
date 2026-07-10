export type ApiErrorBody = {
  error?: string;
  message?: string;
};

export type HealthResponse = {
  status: string;
  service: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
};
