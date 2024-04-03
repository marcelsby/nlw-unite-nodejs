import { prisma } from "../src/lib/prisma";

async function seed() {
  await prisma.event.create({
    data: {
      id: "7afd47eb-f7b9-4c2a-a184-61aaaf6ccc03",
      title: "Unite Summit",
      slug: "unite-summit",
      details: "Um evento p/ devs apaixonados(as) por código!",
      maximumAttendees: 120,
    },
  });
}

seed().then(() => {
  console.log("Database seeded!");
  prisma.$disconnect();
});
