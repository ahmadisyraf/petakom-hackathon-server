import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Hono } from "hono";
import bcrypt from "bcrypt";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import prisma from "../lib/prisma";

const auth = new Hono();

auth.post(
  "/",
  zValidator(
    "json",
    z.object({
      email: z
        .string({ required_error: "Email required" })
        .email({ message: "Invalid email" }),
      password: z.string({ required_error: "Password required" }),
    })
  ),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HTTPException(404, { message: "Invalid user" });
    }

    const payload = {
      ...user,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3,
    }; // 30 days
    const token = await sign(payload, "secret");

    return c.json({ accessToken: token });
  }
);

export default auth;
