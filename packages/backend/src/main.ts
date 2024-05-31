import { Hono } from "hono";
import mp from './mp';
import { serve } from "@hono/node-server";

const app = new Hono();

app.route('/mp', mp);

serve({
  fetch: app.fetch,
  port: 9000,
});
