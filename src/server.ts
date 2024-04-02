import fastify from "fastify";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { generateSlug } from "./utils/generate-slug";

const app = fastify();

const prisma = new PrismaClient({
  log: ["query"],
});

app.post("/events", async (req, res) => {
  const createEventSchema = z.object({
    title: z.string().min(4),
    details: z.string().nullable(),
    maximumAttendees: z.number().int().positive().nullable(),
  });

  const data = createEventSchema.parse(req.body);

  const slug = generateSlug(data.title);

  const eventWithSameSlug = await prisma.event.findUnique({
    where: {
      slug,
    },
  });

  if (eventWithSameSlug != null) {
    res.code(409);
    throw new Error("Another event with same title already exists.");
  }

  const event = await prisma.event.create({
    data: {
      ...data,
      slug: slug,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  res.code(201);

  return { eventId: event.id };
});

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
