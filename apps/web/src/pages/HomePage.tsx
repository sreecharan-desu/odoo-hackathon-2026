// Smoke-test: Bhanu setup verified — no feature work until problem statement (12 Jul).
import { Card, Spinner } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { apiGet, endpoints } from "../lib/api";
import type { HealthResponse } from "../types";

export default function HomePage() {
  const { data, error, loading } = useAsync<HealthResponse>(
    () => apiGet(endpoints.health),
    [],
  );

  return (
    <Card>
      <h1>Project scaffold ready</h1>
      {loading && <Spinner />}
      {error && <p className="error">{error}</p>}
      {data && (
        <p>
          API health: <strong>{data.status}</strong> ({data.service})
        </p>
      )}
      <p className="text-muted">Extend this page after the problem statement is released.</p>
    </Card>
  );
}
