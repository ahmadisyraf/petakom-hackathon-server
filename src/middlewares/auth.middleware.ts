import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";

export const authMiddleware = createMiddleware(async (c, next) => {
  const method = c.req.method;
  const jwtMiddleware = jwt({
    secret: "secret",
  });

  if (["PATCH"].includes(method) && !jwtMiddleware) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  await next();
});
