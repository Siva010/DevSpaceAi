import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || 'postgresql://devspace:devspace_password@127.0.0.1:5433/devspace_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // 1. Create a user
  const passwordHash = await bcrypt.hash('password', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@devspace.ai' },
    update: {},
    create: {
      email: 'admin@devspace.ai',
      fullName: 'Admin User',
      passwordHash,
    },
  });
  console.log('Created user:', user.email);

  // 2. Create a Role
  const role = await prisma.role.upsert({
    where: { name: 'OWNER' },
    update: {},
    create: {
      name: 'OWNER',
      description: 'Workspace Owner',
    },
  });

  // 3. Create an organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme',
    },
  });
  console.log('Created organization:', org.name);

  // 4. Create membership
  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user.id,
      roleId: role.id,
    },
  });

  // 5. Create some projects
  await prisma.project.upsert({
    where: {
      organizationId_key: {
        organizationId: org.id,
        key: 'WEB',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Website Redesign',
      key: 'WEB',
      description: 'Complete overhaul of the marketing site',
    },
  });

  await prisma.project.upsert({
    where: {
      organizationId_key: {
        organizationId: org.id,
        key: 'MOB',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Mobile App V2',
      key: 'MOB',
      description: 'Next gen mobile app',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
