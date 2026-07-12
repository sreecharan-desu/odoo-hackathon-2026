import { API_BASE_URL } from "../../constants";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function getAuthToken(): string | null {
  try {
    const raw = sessionStorage.getItem("transitops_auth");
    if (!raw) return null;
    const auth = JSON.parse(raw) as { token?: string };
    return auth.token ?? null;
  } catch {
    return null;
  }
}

function getHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function parseError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as any;
  if (body.error) return body.error;
  if (body.message) return body.message;
  if (body.detail) {
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((d: any) => `${d.loc?.slice(1).join(".") || "field"}: ${d.msg}`).join("; ");
    }
  }
  return "Request failed";
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  return response.json() as Promise<T>;
}
