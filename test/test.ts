import { hc } from "hono/client";
import { getQueryOptions } from "../src";
import { Hono } from "hono";
import { L } from "vitest/dist/chunks/reporters.anwo7Y6a.js";

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
const api = hc<AppType>("http://localhost");

const id = "aaa";
const value = getQueryOptions(
  () =>
    api.users[":id"].$get({
      param: { id },
    })
  //   undefined
);

console.log("-> ", { value }, "");
