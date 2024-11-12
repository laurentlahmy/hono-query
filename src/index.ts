import {
  queryOptions,
  UndefinedInitialDataOptions,
} from "@tanstack/react-query";
import { ClientResponse, InferResponseType } from "hono/client";

export const q = <
  T extends () => Promise<ClientResponse<InferResponseType<T>>>
>(
  endpoint: T,
  options = {} as Omit<
    UndefinedInitialDataOptions<InferResponseType<T>>,
    "queryKey"
  > & { queryKeyComplement?: string[] }
) => {
  const { queryKeyComplement } = options;
  const honoQueryOptions = queryOptions({
    queryKey: [
      endpoint.toString().split(".").slice(1).join("."),
      ...(queryKeyComplement ?? []),
    ],
    queryFn: async () => {
      const res = await endpoint();
      return (await res.json()) as InferResponseType<T>;
    },
    ...options,
  });

  return honoQueryOptions;
};
