## Generate Tanstack Query queryOptions from Hono RPC endpoints

### Install

```sh
npm i hono-query
```

### tl;dr

```tsx
import { q } from "hono-query";

export const MyReactComponent = () => {
  const { data: userData1 } = useQuery(q(() => api.auth.current_user.$get()));
  // queryOptions are generated automatically with
  // { queryKey: ["auth.current_user.$get()"], queryFn: ... }
  // where queryFn simply returns the json data from the endpoint.
  // return types are inferred.

  const { data: userData2 } = useQuery(
    q(() => api.auth.current_user.$get(), {
      queryKeyComplement: ["some extra key", userId],
    })
  );
  // you can call q with the RPC endpoint and also an option object:
  // optionally pass an array of keys to add to the key:
  // queryKey: ["auth.current_user.$get()", "some extra key", "someUserIdValue"]

  const { data: userData3 } = useQuery(
    q(() => api.auth.current_user.$get(), {
      queryKeyComplement: ["some extra key", userId],
      retry: 5,
      staleTime: 5 * 1000,
    })
  );
  // you can call q with the RPC endpoint and also an option object with
  // an optional queryKeyComplement and any regular queryOption property
};
```

### Why:

The "problem" now is that we need to write [queryKeys](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys) and [queryFunctions](https://tanstack.com/query/v5/docs/framework/react/guides/query-functions) for all routes, as is done [here](https://github.com/betterstack-community/betternews-hono-tanstack/blob/main/frontend/src/lib/api.ts). It seems cumbersome and redundant to add React Query helper functions for all routes when they are all available on the Hono client.

According to [this comment](https://github.com/honojs/hono/issues/727#issuecomment-1378814366) this is missing to a few people and a [selling point for tRPC](https://trpc.io/docs/client/react) over Hono RPC.

### Proposed solution:

I tried to generate Tanstack [queryKey](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys), [queryFn](https://tanstack.com/query/v5/docs/framework/react/guides/query-functions) and [queryOptions](https://tanstack.com/query/v5/docs/framework/react/guides/query-options) by reusing as much of the autocompletion that Hono client provides.

In your frontend code you can do the following:

```tsx
import { q } from "hono-query";

queryClient.fetchQuery(
  q(
    () => api.dashboard.deployments.user[":userId"].$get({ param: { userId } }), // the RPC endpoint you're targeting
    {
      queryKeyComplement: [userId], // a complement you might want to add to the queryKey
      // all properties other than queryKeyComplement are regular queryOptions
      retry: 5, // optionally pass any additional query options
      retryDelay: 1000, // optionally pass any additional query options
      staleTime: 5 * 1000, // optionally pass any additional query options}
    }
  )
);
```

and this will seamlessly generate the query key and function pair that you need when using React Query:

```tsx
{
  queryKey: [
    "dashboard.deployments.user[\":userId\"].$get({ param: { userId } })", // The endpoint is turned into a function name using toString(), which is sometimes replacing variables by name, sometimes by value, I'm not sure exactly why or how
    "6h8s62e7uppe4ee" // The queryKeyComplement. This is dynamic (variables are passed by value, userId has been replaced by "6h8s62e7uppe4ee")
  ],
  queryFn: async () => {
      const res = await api.dashboard.deployments.user[":userId"].$get({ param: { userId } });
      return (await res.json()) as InferResponseType<T>;
  },
  retry: 5, // optionally pass any additional query options
  retryDelay: 1000, // optionally pass any additional query options
  staleTime: 5 * 1000, // optionally pass any additional query options}
}
```

### Current knowns limitations

- Only works for endpoints that return json
- Type errors with useSuspenseQuery

Your contributions are welcome.
