Automatically generate query keys and query options from your Hono RPC client endpoints.

Problem:
The "problem" now is that we need to write queryKeys and queryFunctions for all routes, as is done here. It seems cumbersome and redundant to add React Query helper functions for all routes when they are all available on the Hono client.

According to this comment this is missing to a few people and a selling point for tRPC over Hono RPC.

Proposed solution:
I tried to generate Tanstack queryKey, queryFn and queryOptions by reusing as much of the autocompletion that Hono client provides.

In your frontend code you can do the following:

queryClient.fetchQuery(
getQueryOptions(
() => api.dashboard.deployments.user[':userId'].$get({ param: { userId } }), // the RPC endpoint you're targeting
[userId] // a complement you might want to add to the queryKey
)
)
and this will seamlessly generate the query key and function pair that you need when using React Query:

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
Further improvement:
Add a parameter to pass extra queryOptions to getQueryOptions.
I think it means we need to import types from React Query, which is probably not wanted in this repo.
