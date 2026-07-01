const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },

  connectionTimeoutMillis: 10000,

  idleTimeoutMillis: 30000,

  max: 5,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function connectDatabase() {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed");
    console.log(error.message);
  }
}

module.exports = {
  prisma,
  connectDatabase,
};
