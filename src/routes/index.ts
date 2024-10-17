import { Hono } from "hono";
import users from "../controllers/users.controller";

const app = new Hono().basePath("/api");

app.route("/users", users);

export default app;
