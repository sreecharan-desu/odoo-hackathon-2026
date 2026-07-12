import { API_BASE_URL } from "../../constants";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

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
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body.error === "string") return body.error;
  if (typeof body.message === "string") return body.message;
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) {
    return body.detail
      .map((d: { loc?: unknown[]; msg?: string }) => {
        const loc = Array.isArray(d.loc) ? d.loc.filter((p) => p !== "body").join(".") : "field";
        return `${loc || "field"}: ${d.msg ?? "invalid"}`;
      })
      .join("; ");
  }
  return "Request failed";
}

export function withQuery(
  path: string,
  query: Record<string, string | number | boolean | undefined | null> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
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

/** Fetch a paginated list endpoint and return items (for dropdowns / analytics). */
export async function apiGetItems<T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
): Promise<T[]> {
  const page = await apiGet<PaginatedResponse<T>>(withQuery(path, { limit: 100, offset: 0, ...query }));
  return page.items;
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
