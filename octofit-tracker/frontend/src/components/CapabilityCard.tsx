import type { ReactNode } from 'react';
import type { ApiResource } from '../api/useApiResource.js';

type Props<T> = {
  title: string;
  description: string;
  resource: ApiResource<T>;
  isEmpty: (data: T) => boolean;
  emptyMessage: string;
  children: (data: T) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  resource,
  isEmpty,
  emptyMessage,
  children,
}: Props<T>) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {resource.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {resource.status === 'error' && (
          <p role="alert">Unable to load {title.toLowerCase()}: {resource.message}</p>
        )}
        {resource.status === 'success' && isEmpty(resource.data) && <p>{emptyMessage}</p>}
        {resource.status === 'success' && !isEmpty(resource.data) && children(resource.data)}
      </div>
    </section>
  );
}
