import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { HTTPException } from "hono/http-exception";

const users = new Hono();

const response = {
  select: {
    id: true,
    first_name: true,
    last_name: true,
    email: true,
    created_at: true,
  },
};

users.post(
  "/",
  zValidator(
    "json",
    z.object({
      first_name: z.string({ required_error: "first_name required" }),
      last_name: z.string({ required_error: "last_name required" }),
      email: z
        .string({ required_error: "email required" })
        .email({ message: "Invalid email format" }),
      password: z.string({ required_error: "password required" }),
    })
  ),
  async (c) => {
    const data = c.req.valid("json");

    data.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data,
      ...response,
    });

    return c.json(user);
  }
);

users.get(async (c) => {
  const users = await prisma.user.findMany({
    ...response,
  });

  return c.json(users);
});

users.get("/:id", async (c) => {
  const id = c.req.param("id");

  const user = await prisma.user.findFirst({ where: { id }, ...response });

  if (!user) {
    throw new HTTPException(404, { message: "User not exist" });
  }

  return c.json(user);
});

users.delete("/:id", async (c) => {
  const id = c.req.param("id");

  await prisma.user.delete({ where: { id } });

  return c.json("User deleted");
});

users.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      password: z.string().optional(),
    })
  ),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const user = await prisma.user.findFirst({ where: { id } });

    if (!user) {
      throw new HTTPException(404, { message: "User not exist" });
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      ...response,
    });

    return c.json(updated);
  }
);

export default users;
