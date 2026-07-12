import { useCallback, useEffect, useState } from "react";
import { apiGet, ApiError } from "../lib/api";

type ApiListState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  apiMissing: boolean;
};

export function useApiList<T>(path: string) {
  const [state, setState] = useState<ApiListState<T>>({
    data: null,
    error: null,
    loading: true,
    apiMissing: false,
  });

  const fetchList = useCallback(async () => {
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
    void fetchList();
  }, [fetchList]);

  return { ...state, refetch: fetchList };
}

export function useApiResource<T>(path: string) {
  const [state, setState] = useState<ApiListState<T>>({
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
