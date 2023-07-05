import { prisma } from "../src/server/db";

const NODES = ["A", "B", "C", "D", "E", "F", "G"];

async function main() {
  for (const n of NODES) {
    await prisma.node.upsert({
      where: {
        id: n,
      },
      create: {
        id: n,
      },
      update: {},
    });
  }

  await prisma.link.upsert({
    where: {
      id: "AB",
    },
    create: {
      id: "AB",
      value: 3,
      sourceId: "A",
      targetId: "B",
    },
    update: {},
  });

  await prisma.link.upsert({
    where: {
      id: "AC",
    },
    create: {
      id: "AC",
      value: 4,
      sourceId: "A",
      targetId: "C",
    },
    update: {},
  });

  await prisma.link.upsert({
    where: {
      id: "BD",
    },
    create: {
      id: "BD",
      value: 1,
      sourceId: "B",
      targetId: "D",
    },
    update: {},
  });

  await prisma.link.upsert({
    where: {
      id: "BF",
    },
    create: {
      id: "BF",
      value: 6,
      sourceId: "B",
      targetId: "F",
    },
    update: {},
  });

  await prisma.link.upsert({
    where: {
      id: "CD",
    },
    create: {
      id: "CD",
      value: 2,
      sourceId: "C",
      targetId: "D",
    },
    update: {},
  });

  await prisma.link.upsert({
    where: {
      id: "CE",
    },
    create: {
      id: "CE",
      value: 6,
      sourceId: "C",
      targetId: "E",
    },
    update: {},
  });

  await prisma.link.upsert({
    where: {
      id: "DE",
    },
    create: {
      id: "DE",
      value: 4,
      sourceId: "D",
      targetId: "E",
    },
    update: {},
  });

  await prisma.link.upsert({
    where: {
      id: "DF",
    },
    create: {
      id: "DF",
      value: 7,
      sourceId: "D",
      targetId: "F",
    },
    update: {},
  });

  await prisma.link.upsert({
    where: {
      id: "EG",
    },
    create: {
      id: "EG",
      value: 2,
      sourceId: "E",
      targetId: "G",
    },
    update: {},
  });

  await prisma.link.upsert({
    where: {
      id: "EF",
    },
    create: {
      id: "EF",
      value: 3,
      sourceId: "E",
      targetId: "F",
    },
    update: {},
  });

  await prisma.link.upsert({
    where: {
      id: "GF",
    },
    create: {
      id: "GF",
      value: 5,
      sourceId: "G",
      targetId: "F",
    },
    update: {},
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
