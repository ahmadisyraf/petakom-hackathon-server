import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma";
import { jwt } from "hono/jwt";
import { HTTPException } from "hono/http-exception";

const organization = new Hono();

const response = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    createdAt: true,
    organization: true,
  },
};

organization.post(
  "/",
  jwt({
    secret: "secret",
  }),
  zValidator(
    "json",
    z.object({
      organizationName: z.string({
        required_error: "Organization name required",
      }),
    })
  ),
  async (c) => {
    const data = c.req.valid("json");
    const { id } = c.get("jwtPayload");

    const createdOrganization = await prisma.organization.create({
      data: {
        ...data,
        memberKey: uuidv4(),
        user: {
          connect: {
            id,
          },
        },
      },
    });

    if (createdOrganization) {
      await prisma.user.update({
        data: {
          role: "organization",
        },
        where: {
          id,
        },
      });
    }

    return c.json(createdOrganization);
  }
);

organization.patch(
  "/join",
  jwt({
    secret: "secret",
  }),
  zValidator(
    "json",
    z.object({
      memberKey: z.string({ required_error: "Member key required" }),
    })
  ),
  async (c) => {
    const { id } = c.get("jwtPayload");
    const { memberKey } = c.req.valid("json");

    const findOrganization = await prisma.organization.findUnique({
      where: { memberKey },
    });

    if (!findOrganization) {
      throw new HTTPException(404, { message: "Organization not found" });
    }

    const joinedOrganization = await prisma.user.update({
      where: {
        id,
      },
      data: {
        organization: {
          connect: {
            memberKey,
          },
        },
        role: "organization",
      },
      ...response,
    });

    return c.json(joinedOrganization);
  }
);

organization.get(
  "/",
  jwt({
    secret: "secret",
  }),
  async (c) => {
    const { id } = c.get("jwtPayload");

    const currentOrganization = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        organization: true,
      },
    });

    return c.json(currentOrganization);
  }
);

export default organization;
