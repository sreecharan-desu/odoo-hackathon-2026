import { useCallback, useEffect, useState } from "react";
import { apiGet, ApiError, withQuery, type PaginatedResponse } from "../lib/api";

const DEFAULT_PAGE_SIZE = 25;

type ApiListState<T> = {
  data: T[] | null;
  total: number;
  limit: number;
  offset: number;
  error: string | null;
  loading: boolean;
  apiMissing: boolean;
};

type UseApiListOptions = {
  limit?: number;
  offset?: number;
  query?: Record<string, string | number | undefined>;
};

export function useApiList<T>(path: string, options: UseApiListOptions = {}) {
  const limit = options.limit ?? DEFAULT_PAGE_SIZE;
  const offset = options.offset ?? 0;
  const queryKey = JSON.stringify(options.query ?? {});

  const [state, setState] = useState<ApiListState<T>>({
    data: null,
    total: 0,
    limit,
    offset,
    error: null,
    loading: true,
    apiMissing: false,
  });

  const fetchList = useCallback(async () => {
    setState((prev) => ({ ...prev, error: null, loading: true, apiMissing: false }));
    try {
      const query = { ...(options.query ?? {}), limit, offset };
      const page = await apiGet<PaginatedResponse<T>>(withQuery(path, query));
      setState({
        data: page.items,
        total: page.total,
        limit: page.limit,
        offset: page.offset,
        error: null,
        loading: false,
        apiMissing: false,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setState((prev) => ({
          ...prev,
          data: null,
          total: 0,
          error: null,
          loading: false,
          apiMissing: true,
        }));
        return;
      }
      const message = err instanceof Error ? err.message : "Something went wrong";
      setState((prev) => ({
        ...prev,
        data: null,
        total: 0,
        error: message,
        loading: false,
        apiMissing: false,
      }));
    }
  }, [path, limit, offset, queryKey]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  return { ...state, refetch: fetchList };
}

export function useApiResource<T>(path: string) {
  const [state, setState] = useState<{
    data: T | null;
    error: string | null;
    loading: boolean;
    apiMissing: boolean;
  }>({
    data: null,
    error: null,
    loading: true,
    apiMissing: false,
  });

  const fetchResource = useCallback(async () => {
    setState({ data: null, error: null, loading: true, apiMissing: false });
    try {
      const data = await apiGet<T>(path);
      setState({ data, error: null, loading: false, apiMissing: false });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setState({ data: null, error: null, loading: false, apiMissing: true });
        return;
      }
      const message = err instanceof Error ? err.message : "Something went wrong";
      setState({ data: null, error: message, loading: false, apiMissing: false });
    }
  }, [path]);

  useEffect(() => {
    void fetchResource();
  }, [fetchResource]);

  return { ...state, refetch: fetchResource };
}
