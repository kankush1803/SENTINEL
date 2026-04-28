const path = require("path");
const dotenv = require("dotenv");
const envPath = path.resolve(__dirname, "./.env");
dotenv.config({ path: envPath });

const { PrismaClient } = require("@prisma/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");
const { createClient } = require("@libsql/client");

const dbPath = path.resolve(__dirname, "./dev.db");
const dbUrl = `file:${dbPath}`;

// Set DATABASE_URL for Prisma 6
process.env.DATABASE_URL = dbUrl;

const libsql = createClient({
  url: dbUrl,
});

const adapter = new PrismaLibSQL(libsql);

async function test() {
  console.log("Initializing PrismaClient with Prisma 6...");
  try {
    const prisma = new PrismaClient({ adapter });
    console.log("Testing query...");
    const users = await prisma.user.findMany();
    console.log("Success! Users found:", users.length);
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

test();
