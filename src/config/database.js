// File: src/config/database.js
const { PrismaClient } = require('@prisma/client');

// Mencegah multiple instance saat hot-reloading di development
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'], // Log query untuk debugging (Day 2 requirement)
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;