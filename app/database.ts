import { SQLDatabase } from "encore.dev/storage/sqldb";
import { PrismaClient } from "@prisma/client";

// Define a database named 'encore_prisma_test', using the database migrations
// in the "./prisma/migrations" folder (where prisma will generate their migrations).
// Set `source` to `prisma` to let Encore know that the migrations are generated by Prisma.
const DB = new SQLDatabase("imymemind_test", {
  migrations: {
    path: "./prisma/migrations",
    source: "prisma",
  },
});

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DB.connectionString,
    },
  },
});

export { prisma };
