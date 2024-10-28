import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { z } from "zod";
import prisma from "../lib/prisma";

const donation = new Hono();

donation.get("/", jwt({ secret: "secret" }), async (c) => {
  const { id } = c.get("jwtPayload");
  const status = c.req.query("status");

  const getUserDonation = await prisma.donation.findMany({
    where: {
      AND: {
        status: status as "pending" | "reserved" | "completed",
        user: { id },
      },
    },
  });

  return c.json(getUserDonation);
});

donation.post(
  "/",
  jwt({
    secret: "secret",
  }),
  zValidator(
    "json",
    z.object({
      title: z.string({ required_error: "Donation title required" }),
      description: z.string({ required_error: "foodType" }),
      donationSize: z.string({ required_error: "Donation size required" }),
      foodType: z.string({ required_error: "Food type required" }),
      transportationMethod: z.enum([
        "request_for_pickup",
        "deliver_to_organization",
      ]),
      status: z
        .enum(["completed", "pending", "reserved"])
        .optional()
        .default("pending"),
    })
  ),
  async (c) => {
    const { id } = c.get("jwtPayload");
    const data = c.req.valid("json");

    const createdDonation = await prisma.donation.create({
      data: {
        ...data,
        user: { connect: { id } },
      },
    });

    return c.json(createdDonation);
  }
);

donation.get(
  "/:id",
  jwt({ secret: "secret" }),
  zValidator(
    "param",
    z.object({
      id: z.string({ required_error: "Donation id required" }),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");

    const getDonation = await prisma.donation.findFirst({
      where: {
        id,
      },
    });

    return c.json(getDonation);
  }
);

donation.patch(
  "/:id",
  jwt({ secret: "secret" }),
  zValidator(
    "param",
    z.object({
      id: z.string({ required_error: "Donation id required" }),
    })
  ),
  zValidator(
    "json",
    z.object({
      title: z.string({ required_error: "Donation title required" }).optional(),
      description: z.string({ required_error: "foodType" }).optional(),
      donationSize: z
        .string({ required_error: "Donation size required" })
        .optional(),
      foodType: z.string({ required_error: "Food type required" }).optional(),
      transportationMethod: z
        .enum(["request_for_pickup", "deliver_to_organization"])
        .optional(),
      status: z.enum(["completed", "pending", "reserved"]).optional(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    const updatedData = await prisma.donation.update({
      data: {
        ...data,
      },
      where: {
        id,
      },
    });

    return c.json(updatedData);
  }
);

export default donation;
