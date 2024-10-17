import { Hono } from "hono";
import users from "../controllers/users.controller";

const app = new Hono();

app.route("/users", users);

export default app;