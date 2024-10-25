import { Hono } from "hono";
import users from "../controllers/users.controller";
import auth from "../controllers/auth.controller";
import { logger } from "hono/logger";
import organization from "../controllers/organization.controller";
import donation from "../controllers/donation.controller";

const app = new Hono();

app.use(logger());

app.route("/users", users);
app.route("/auth", auth);
app.route("/organization", organization);
app.route("/donation", donation);

app.notFound((c) => {
  return c.text("Route not found", 404);
});

export default app;
