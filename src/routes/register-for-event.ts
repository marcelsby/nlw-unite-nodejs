import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Register for an event",
        tags: ["attendees"],
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          201: z.object({
            attendeeId: z.number(),
          }),
        },
      },
    },
    async (req, res) => {
      const { eventId } = req.params;
      const { email, name } = req.body;

      const eventToRegister = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
        select: {
          maximumAttendees: true,
        },
      });

      if (!eventToRegister) {
        throw new BadRequest(
          "A event with the provided 'eventId' does not exists."
        );
      }

      const [amountOfAttendeesForEvent, attendeeByEmail] = await Promise.all([
        prisma.attendee.count({
          where: {
            eventId: eventId,
          },
        }),
        prisma.attendee.findUnique({
          where: {
            eventId_email: {
              email,
              eventId,
            },
          },
          select: {
            id: true,
          },
        }),
      ]);

      if (
        eventToRegister.maximumAttendees &&
        amountOfAttendeesForEvent >= eventToRegister.maximumAttendees
      ) {
        throw new BadRequest(
          "This event reached the maximum number of attendees."
        );
      }

      if (attendeeByEmail) {
        throw new BadRequest(
          "This e-mail is already registered for this event."
        );
      }

      const attendee = await prisma.attendee.create({
        data: {
          name,
          email,
          eventId,
        },
      });

      return res.status(201).send({ attendeeId: attendee.id });
    }
  );
}
