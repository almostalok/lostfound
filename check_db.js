const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany();
  console.log("Matches:", matches);
  
  const lostItems = await prisma.lostItem.findMany();
  console.log("Lost Items:", lostItems);

  const foundItems = await prisma.foundItem.findMany();
  console.log("Found Items:", foundItems);
}

main().finally(() => prisma.$disconnect());
