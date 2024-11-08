# Automatically generate query keys and query options from your Hono RPC client endpoints.

### Install

```sh
npm i hono-query
```

### Problem:

The "problem" now is that we need to write [queryKeys](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys) and [queryFunctions](https://tanstack.com/query/v5/docs/framework/react/guides/query-functions) for all routes, as is done [here](https://github.com/betterstack-community/betternews-hono-tanstack/blob/main/frontend/src/lib/api.ts). It seems cumbersome and redundant to add React Query helper functions for all routes when they are all available on the Hono client.

According to [this comment](https://github.com/honojs/hono/issues/727#issuecomment-1378814366) this is missing to a few people and a [selling point for tRPC](https://trpc.io/docs/client/react) over Hono RPC.

### Proposed solution:

I tried to generate Tanstack [queryKey](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys), [queryFn](https://tanstack.com/query/v5/docs/framework/react/guides/query-functions) and [queryOptions](https://tanstack.com/query/v5/docs/framework/react/guides/query-options) by reusing as much of the autocompletion that Hono client provides.

In your frontend code you can do the following:

```tsx
queryClient.fetchQuery(
  getQueryOptions(
    () => api.dashboard.deployments.user[":userId"].$get({ param: { userId } }), // the RPC endpoint you're targeting
    [userId], // a complement you might want to add to the queryKey
    retry: 5, // optionally pass any additional query options
    retryDelay: 1000, // optionally pass any additional query options
    staleTime: 5 * 1000, // optionally pass any additional query options
  )
);
```

and this will seamlessly generate the query key and function pair that you need when using React Query:

```tsx
{
  queryKey: [
    "dashboard.deployments.user[\":userId\"].$get({ param: { userId } })", // this is static (variables are passed by name, like userId here)
    "6h8s62e7uppe4ee" // this is dynamic (variables are passed by value, userId has been replaced by "6h8s62e7uppe4ee")
  ],
  queryFn: async (): Promise<ResType> => {
    const res = await api.dashboard.deployments.user[':userId'].$get({ param: { userId } };
    if (!res.ok) {
      throw new Error("server error");
    }
    const data = await res.json();
    return data;
  }
}
```
