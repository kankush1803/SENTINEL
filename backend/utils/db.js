const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");

const url = process.env.TURSO_URL;
const token = process.env.TURSO_AUTH_TOKEN;

const adapter = new PrismaLibSQL({
  url: url,
  authToken: token,
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
