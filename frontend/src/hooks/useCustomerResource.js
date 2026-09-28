import { useEffect, useState } from "react";
import { customerRequest, errorMessage } from "../api";
import { useStore } from "../store/context";

export default function useCustomerResource(url) {
  const { invalidateSession } = useStore();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const current = result?.url === url && result?.attempt === attempt;

  useEffect(() => {
    const controller = new AbortController();

    customerRequest({ url, signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setResult({ url, attempt, data });
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if ([401, 403].includes(error.response?.status)) {
          invalidateSession();
        } else {
          setResult({ url, attempt, error: errorMessage(error) });
        }
      });

    return () => controller.abort();
  }, [url, attempt, invalidateSession]);

  return {
    data: current ? result.data : null,
    error: current ? result.error : "",
    loading: !current,
    retry: () => setAttempt((value) => value + 1),
  };
}
