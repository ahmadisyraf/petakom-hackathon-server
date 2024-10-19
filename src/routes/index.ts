import { Hono } from "hono";
import users from "../controllers/users.controller";
import auth from "../controllers/auth.controller";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());

app.route("/users", users);
app.route("/auth", auth);

app.notFound((c) => {
  return c.text("Route not found", 404);
});

export default app;
