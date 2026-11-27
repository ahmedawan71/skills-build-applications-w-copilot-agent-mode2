import { useEffect, useState } from 'react';
import { getJson } from './client.js';

export type ApiResource<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

export function useApiResource<T>(path: string): ApiResource<T> {
  const [resource, setResource] = useState<ApiResource<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setResource({ status: 'loading' });

    getJson<T>(path)
      .then((data) => {
        if (active) setResource({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'Unexpected response.';
        setResource({ status: 'error', message });
      });

    return () => {
      active = false;
    };
  }, [path]);

  return resource;
}
