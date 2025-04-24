import { useState, useEffect } from "react";
import { toast } from "sonner";

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

type FetchFunction<T> = () => Promise<T>;

export function useFetch<T>(
  fetchFn: FetchFunction<T>,
  dependencies: unknown[] = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  } = {}
) {
  const { immediate = true, onSuccess, onError, showToast = true } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const fetchData = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const data = await fetchFn();
      setState({ data, isLoading: false, error: null });

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState((prev) => ({ ...prev, isLoading: false, error: err }));

      if (onError) {
        onError(err);
      }

      if (showToast) {
        toast.error(err.message || "An error occurred");
      }

      throw err;
    }
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, immediate]);

  return {
    ...state,
    refetch: fetchData,
  };
}

// Mutation hook for POST, PUT, DELETE operations
export function useMutation<T, R = void>(
  mutationFn: (data: T) => Promise<R>,
  options: {
    onSuccess?: (data: R) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  } = {}
) {
  const { onSuccess, onError, showToast = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (data: T) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await mutationFn(data);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);

      if (onError) {
        onError(err);
      }

      if (showToast) {
        toast.error(err.message || "An error occurred");
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
    error,
  };
}
