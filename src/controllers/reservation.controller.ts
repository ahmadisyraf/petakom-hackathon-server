import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { z } from "zod";
import prisma from "../lib/prisma";
import { HTTPException } from "hono/http-exception";

const reservation = new Hono();

reservation.post(
  "/:donationId",
  jwt({ secret: "secret" }),
  zValidator(
    "param",
    z.object({
      donationId: z.string({ required_error: "Reservation id required" }),
    })
  ),
  async (c) => {
    const { id } = c.get("jwtPayload");
    const { donationId } = c.req.valid("param");

    const userInformation = await prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!userInformation) {
      throw new HTTPException(404, { message: "User not found" });
    }

    if (!userInformation.organizationId) {
      throw new HTTPException(404, { message: "User not organization member" });
    }

    const reserveDonation = await prisma.reservation.create({
      data: {
        donation: {
          connect: {
            id: donationId,
          },
        },
        organization: {
          connect: {
            id: userInformation.organizationId,
          },
        },
        status: "reserved",
      },
    });

    return c.json(reserveDonation);
  }
);

reservation.patch(
  "/:reservationId",
  jwt({ secret: "secret" }),
  zValidator(
    "param",
    z.object({
      reservationId: z.string({ required_error: "Reservation id required" }),
    })
  ),
  zValidator(
    "json",
    z.object({
      status: z.enum(["reserved", "completed", "cancelled"]),
    })
  ),
  async (c) => {
    const { reservationId } = c.req.valid("param");
    const { status } = c.req.valid("json");

    const updateReservation = await prisma.reservation.update({
      data: {
        status,
      },
      where: {
        id: reservationId,
      },
    });

    return c.json(updateReservation);
  }
);

reservation.get("/", jwt({ secret: "secret" }), async (c) => {
  const { id } = c.get("jwtPayload");

  const findReservation = await prisma.reservation.findMany({
    where: {
      organizationId: id,
    },
  });

  return c.json(findReservation);
});

export default reservation;
