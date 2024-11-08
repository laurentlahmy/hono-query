import { QueryOptions } from "@tanstack/react-query";
import { InferResponseType } from "hono";

/**
 * Generate a TanStack Query key from a Hono client function
 *
 * @example
 * getQueryKey(
 *     () => api.dashboard.deployments.user[':userId'].$get({ param: { userId } }),
 *     [userId]
 * )
 * Returns:
 * [
 *   "dashboard.deployments.user[\":userId\"].$get({ param: { userId } })",
 *   "6h8s62e7uppe4ee"
 * ]
 *
 * @param fn - function that returns the Hono client function: () => api.$get()
 * @param keyComplement - Additional key elements
 * @returns Array containing a query key string based on the hono client function name, and additional elements passed by the user.
 */
export function getQueryKey<T extends () => unknown>(
  fn: T,
  keyComplement: unknown[] = [undefined]
) {
  const queryKeyString = fn.toString().split(".").slice(1).join(".");
  return [queryKeyString, ...keyComplement].filter(Boolean);
}

/**
 * Generate a TanStack Query function from a Hono client function
 *
 * @example
 * getQueryFn(()=> api.dashboard.deployments.user[':userId'].$get({ param: { userId } }))
 * Returns:
 * async (): Promise<ResType> => {
 *   const res = await api.dashboard.deployments.user[':userId'].$get({ param: { userId } };
 *   if (!res.ok) {
 *     throw new Error("server error");
 *   }
 *   const data = await res.json();
 *   return data;
 * }
 *
 * @param fn - function that returns the Hono client function: () => api.$get()
 * @returns Async function that handles the API call and response
 */
export function getQueryFn<T extends () => unknown>(fn: T) {
  type ResType = InferResponseType<T>;

  return async (): Promise<ResType> => {
    const res = (await fn()) as Response;
    if (!res.ok) {
      throw new Error("server error");
    }
    const data = await res.json();
    return data;
  };
}

/**
 * Generate TanStack Query options from a Hono client function
 *
 * @example
 * getQueryOptions(
 *    () => api.dashboard.deployments.user[':userId'].$get({ param: { userId } }),
 *    [userId]
 * )
 * Returns:
 * {
 *   queryKey: [
 *     "dashboard.deployments.user[\":userId\"].$get({ param: { userId } })",
 *     "6h8s62e7uppe4ee"
 *   ],
 *   queryFn: async (): Promise<ResType> => {
 *     const res = await api.dashboard.deployments.user[':userId'].$get({ param: { userId } };
 *     if (!res.ok) {
 *       throw new Error("server error");
 *     }
 *     const data = await res.json();
 *     return data;
 *   }
 * }
 *
 * @param fn - Hono client function
 * @param keyComplement - Additional key elements
 * @returns Object containing queryKey and queryFn
 */
export function getQueryOptions<T extends () => unknown>(
  fn: T,
  keyComplement: unknown[] = [undefined],
  ...queryOptions: Partial<QueryOptions>[]
) {
  // Merge all query options objects into a single object
  const mergedQueryOptions = Object.assign({}, ...queryOptions);

  return {
    queryKey: getQueryKey(fn, keyComplement),
    queryFn: getQueryFn(fn),
    ...mergedQueryOptions,
  };
}
