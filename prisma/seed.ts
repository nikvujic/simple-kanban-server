import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  const name = process.env.SEED_USER_NAME ?? 'Admin';
  const plainPassword = process.env.SEED_USER_PASSWORD;

  if (!email || !plainPassword) {
    throw new Error('Missing SEED_USER_EMAIL or SEED_USER_PASSWORD in .env');
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('User already exists');
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  });

  console.log('Seeded user:', {
    id: user.id,
    email: user.email,
    name: user.name,
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