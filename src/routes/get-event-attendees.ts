import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getEventAttendees(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Get an event attendees",
        tags: ["events"],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        querystring: z.object({
          query: z.string().nullish(),
          page: z.coerce.number().int().min(1).default(1),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.number().int(),
              name: z.string(),
              email: z.string().email(),
              createdAt: z.date(),
              checkedInAt: z.date().nullable(),
            })
          ),
        },
      },
    },
    async (req, res) => {
      const { eventId } = req.params;
      const { page, query } = req.query;

      const attendees = await prisma.attendee.findMany({
        where: query
          ? {
              eventId,
              name: {
                contains: query,
              },
            }
          : {
              eventId,
            },
        include: {
          checkIn: {
            select: {
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        skip: (page - 1) * 10,
      });

      if (attendees.length == 0) {
        return res.send([]);
      }

      return res.send(
        attendees.map(({ id, name, email, createdAt, checkIn }) => {
          return {
            id,
            name,
            email,
            createdAt: createdAt,
            checkedInAt: checkIn?.createdAt ?? null,
          };
        })
      );
    }
  );
}
