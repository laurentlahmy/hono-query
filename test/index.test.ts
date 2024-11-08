// import { getQueryOptions } from "../src";

import { Hono } from "hono";
import { hc } from "hono/client";
import { expect, describe, it } from "vitest";
import { getQueryKey, getQueryFn, getQueryOptions } from "../src";

// getQueryOptions(
//     () => api.dashboard.deployments.user[":userId"].$get({ param: { userId: "aaa" } }), // the RPC endpoint you're targeting
//     ["abc"], // a complement you might want to add to the queryKey
//     retry: 5, // optionally pass any additional query options
//     retryDelay: 1000, // optionally pass any additional query options
//     staleTime: 5 * 1000, // optionally pass any additional query options
//   )

describe("TanStack Query Helper Functions", () => {
  // Setup a sample Hono app for testing
  const app = new Hono();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const route = app
    .get("/users/:id", (c) => {
      return c.json({
        id: c.req.param("id"),
        name: "John Doe",
      });
    })
    .get("/posts", (c) => {
      return c.json([
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
      ]);
    });

  type AppType = typeof route;
  const client = hc<AppType>("http://localhost");

  describe("getQueryKey", () => {
    it("should generate correct query key for simple endpoints", () => {
      const key = getQueryKey(() => client.posts.$get());
      expect(key).toEqual(["posts.$get()"]);
    });

    it("should generate correct query key for parameterized endpoints", () => {
      const id = "123";
      const key = getQueryKey(
        () => client.users[":id"].$get({ param: { id } }),
        [id]
      );
      expect(key).toEqual([
        'users[":id"].$get({ param: { id: "123" } })',
        "123",
      ]);
    });

    it("should include all provided key complements", () => {
      const key = getQueryKey(() => client.posts.$get(), ["extra1", "extra2"]);
      expect(key).toEqual(["posts.$get()", "extra1", "extra2"]);
    });
  });

  describe("getQueryFn", () => {
    it("should return a function that makes the API call", async () => {
      const queryFn = getQueryFn(() => client.posts.$get());
      expect(queryFn).toBeInstanceOf(Function);
    });

    it("should throw error for non-ok responses", async () => {
      const queryFn = getQueryFn(
        () => Promise.resolve(new Response(null, { status: 500 })) as unknown
      );
      await expect(queryFn()).rejects.toThrow("server error");
    });

    // it("should return parsed JSON data for successful responses", async () => {
    //   const mockData = { success: true };
    //   const queryFn = getQueryFn(
    //     () =>
    //       Promise.resolve(
    //         new Response(JSON.stringify(mockData), {
    //           status: 200,
    //           headers: { "Content-Type": "application/json" },
    //         })
    //       ) as unknown
    //   );
    //   const result = await queryFn();
    //   expect(result).toEqual(mockData);
    // });
  });

  describe("getQueryOptions", () => {
    it("should return combined queryKey and queryFn", () => {
      const userId = "123";
      const options = getQueryOptions(
        () => client.users[":id"].$get({ param: { id: userId } }),
        [userId]
      );

      expect(options).toHaveProperty("queryKey");
      expect(options).toHaveProperty("queryFn");
      expect(options.queryKey).toEqual([
        'users[":id"].$get({ param: { id: "123" } })',
        "123",
      ]);
      expect(options.queryFn).toBeInstanceOf(Function);
    });

    it("should handle undefined keyComplement", () => {
      const options = getQueryOptions(() => client.posts.$get());
      expect(options.queryKey).toEqual(["posts.$get()", undefined]);
      expect(options.queryFn).toBeInstanceOf(Function);
    });

    it("should work with the returned queryFn", async () => {
      const mockData = { success: true };
      const options = getQueryOptions(
        () =>
          Promise.resolve(
            new Response(JSON.stringify(mockData), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          ) as unknown
      );

      const result = await options.queryFn();
      expect(result).toEqual(mockData);
    });
  });
});
