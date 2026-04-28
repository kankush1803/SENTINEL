const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");
const { createClient } = require("@libsql/client");

// Use absolute path for SQLite
const dbPath = path.resolve(__dirname, "../dev.db");
const dbUrl = `file:${dbPath}`;

process.env.DATABASE_URL = dbUrl;

console.log("Using database at:", dbUrl);

// For now, let's use standard Prisma client to bypass adapter issues
const prisma = new PrismaClient();

module.exports = prisma;
