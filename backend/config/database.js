const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function connectDatabase() {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");
    console.log(process.env.DATABASE_URL);
  } catch (error) {
    console.log("Database connection failed");
    console.log(error.message);
  }
}

module.exports = {
  prisma,
  connectDatabase,
};
