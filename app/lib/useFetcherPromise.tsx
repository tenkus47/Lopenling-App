import { useRef, useEffect, useCallback } from 'react';
import { SubmitFunction, useFetcher } from '@remix-run/react';
export function useFetcherWithPromise() {
  let resolveRef = useRef<any>();
  let promiseRef = useRef<Promise<any>>();
  let fetcher = useFetcher();

  if (!promiseRef.current) {
    promiseRef.current = new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }

  const resetResolver = useCallback(() => {
    promiseRef.current = new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, [promiseRef, resolveRef]);

  const submit: SubmitFunction = useCallback(
    async (...args) => {
      fetcher.submit(...args);
      return promiseRef.current;
    },
    [fetcher, promiseRef]
  );

  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      resolveRef.current(fetcher.data);
      resetResolver();
    }
  }, [fetcher, resetResolver]);

  return { ...fetcher, submit };
}
