import { Hono } from "hono";
import users from "../controllers/users.controller";
import auth from "../controllers/auth.controller";
import { logger } from "hono/logger";
import { authMiddleware } from "../middlewares/auth.middleware";
import organization from "../controllers/organization.controller";

const app = new Hono();

app.use(logger());

app.route("/users", users);
app.route("/auth", auth);
app.route("/organization", organization);

app.notFound((c) => {
  return c.text("Route not found", 404);
});

export default app;
