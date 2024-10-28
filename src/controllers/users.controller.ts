import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";

const users = new Hono();

const response = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    createdAt: true,
    organization: true,
    donation: true,
    userAddress: true,
    userContact: true
  },
};

users.post(
  "/",
  zValidator(
    "json",
    z.object({
      firstName: z.string({ required_error: "first_name required" }),
      lastName: z.string({ required_error: "last_name required" }),
      email: z
        .string({ required_error: "email required" })
        .email({ message: "Invalid email format" }),
      password: z.string({ required_error: "password required" }),
      role: z.enum(["user", "organization"]).optional(),
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

users.get("/", async (c) => {
  const users = await prisma.user.findMany({
    ...response,
  });

  return c.json(users);
});

users.get("/current-user", jwt({ secret: "secret" }), async (c) => {
  const { id } = c.get("jwtPayload");

  const user = await prisma.user.findUnique({
    where: { id },
    ...response,
  });

  if (!user) {
    throw new HTTPException(404, { message: "User not exist" });
  }

  return c.json(user);
});

users.delete(
  "/",
  jwt({
    secret: "secret",
  }),
  async (c) => {
    const id = c.get("jwtPayload");

    await prisma.user.delete({ where: { id } });

    return c.json("User deleted");
  }
);

users.patch(
  "/",
  jwt({
    secret: "secret",
  }),
  zValidator(
    "json",
    z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      password: z.string().optional(),
    })
  ),
  async (c) => {
    const { id } = c.get("jwtPayload");
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

users.post(
  "/address",
  jwt({
    secret: "secret",
  }),
  zValidator(
    "json",
    z.object({
      street: z.string({ required_error: "Street requied" }),
      city: z.string({ required_error: "City required" }),
      state: z.string({ required_error: "State required" }),
      postcode: z.string({ required_error: "Postcode required" }),
    })
  ),
  async (c) => {
    const { id } = c.get("jwtPayload");
    const data = c.req.valid("json");

    const createdAddress = await prisma.userAddress.create({
      data: {
        ...data,
        user: {
          connect: {
            id,
          },
        },
      },
      include: {
        user: {
          ...response,
        },
      },
    });

    return c.json(createdAddress);
  }
);

users.patch(
  "/address",
  jwt({ secret: "secret" }),
  zValidator(
    "json",
    z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postcode: z.string().optional(),
    })
  ),
  async (c) => {
    const { id } = c.get("jwtPayload");
    const data = c.req.valid("json");

    const updateAddress = await prisma.userAddress.update({
      data: {
        ...data,
      },
      where: {
        userId: id,
      },
    });

    return c.json(updateAddress);
  }
);

users.post(
  "/contact",
  jwt({
    secret: "secret",
  }),
  zValidator(
    "json",
    z.object({
      phoneNumber: z.string({ required_error: "Phone number required" }),
    })
  ),
  async (c) => {
    const { id } = c.get("jwtPayload");
    const data = c.req.valid("json");

    const createdContact = await prisma.userContact.create({
      data: {
        ...data,
        user: {
          connect: {
            id,
          },
        },
      },
      include: {
        user: {
          ...response,
        },
      },
    });

    return c.json(createdContact);
  }
);

users.patch(
  "/contact",
  jwt({ secret: "secret" }),
  zValidator(
    "json",
    z.object({
      phoneNumber: z.string({ required_error: "Phone number required" }),
    })
  ),
  async (c) => {
    const { id } = c.get("jwtPayload");
    const data = c.req.valid("json");

    const updatedContact = await prisma.userContact.update({
      data: {
        ...data,
      },
      where: {
        userId: id,
      },
    });

    return c.json(updatedContact);
  }
);

export default users;
