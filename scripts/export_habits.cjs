/**
 * Export habits to scripts/habits.json for recommender training.
 * Run with: node scripts/export_habits.cjs
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const habits = await prisma.habit.findMany({
    select: { id: true, name: true, description: true },
  });
  const outPath = path.join(__dirname, "habits.json");
  fs.writeFileSync(outPath, JSON.stringify({ habits }, null, 2));
  console.log(`wrote ${habits.length} habits to ${outPath}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
