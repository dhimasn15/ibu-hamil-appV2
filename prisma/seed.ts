import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await prisma.adminUser.upsert({
    where: { email: "admin@bundacare.id" },
    update: {},
    create: {
      name: "Admin BundaCare",
      email: "admin@bundacare.id",
      passwordHash,
      role: "admin",
      qrToken: "ADM-BUNDACARE-001",
      region: "Kelurahan Sukamaju",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
