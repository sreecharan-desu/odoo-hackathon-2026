import { useCallback, useEffect, useState } from "react";

type AsyncState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export function useAsync<T>(asyncFn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: true,
  });

  const run = useCallback(async () => {
    setState({ data: null, error: null, loading: true });
    try {
      const data = await asyncFn();
      setState({ data, error: null, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setState({ data: null, error: message, loading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  return { ...state, refetch: run };
}
