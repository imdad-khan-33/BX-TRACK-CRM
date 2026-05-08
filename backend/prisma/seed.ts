import { v4 as uuid } from 'uuid';
import { hash } from 'bcryptjs';
import { getPrismaClient } from '../src/config/database';

const prisma = getPrismaClient();

/**
 * Seed script - Creates demo data for development
 */
async function main() {
  console.log('Seeding database...');

  try {
    // Clean up existing data
    await prisma.activityLog.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
    console.log('Cleaned existing data');

    // Create organizations
    const org1 = await prisma.organization.create({
      data: {
        id: uuid(),
        name: 'Microsoft',
      },
    });

    const org2 = await prisma.organization.create({
      data: {
        id: uuid(),
        name: 'Tech Startup Inc',
      },
    });

    console.log('✓ Created organizations');

    // Create users for org1
    const admin1 = await prisma.user.create({
      data: {
        id: uuid(),
        organizationId: org1.id,
        name: 'Imdad Admin',
        email: 'imdadkhanr9@gmail.com',
        passwordHash: await hash('password123', 10),
        role: 'admin',
      },
    });

    const member1 = await prisma.user.create({
      data: {
        id: uuid(),
        organizationId: org1.id,
        name: 'Alice Member',
        email: 'alice@acme.com',
        passwordHash: await hash('password123', 10),
        role: 'member',
      },
    });

    const member2 = await prisma.user.create({
      data: {
        id: uuid(),
        organizationId: org1.id,
        name: 'Bob Member',
        email: 'bob@acme.com',
        passwordHash: await hash('password123', 10),
        role: 'member',
      },
    });


    // Create users for org2
await prisma.user.create({
      data: {
        id: uuid(),
        organizationId: org2.id,
        name: 'Sarah Admin',
        email: 'sarah@techstartup.com',
        passwordHash: await hash('password123', 10),
        role: 'admin',
      },
    });

    const member3 = await prisma.user.create({
      data: {
        id: uuid(),
        organizationId: org2.id,
        name: 'Charlie Member',
        email: 'charlie@techstartup.com',
        passwordHash: await hash('password123', 10),
        role: 'member',
      },
    });

    console.log('✓ Created users');

    // Create customers for org1
    const customers1 = [];
    for (let i = 1; i <= 15; i++) {
      const customer = await prisma.customer.create({
        data: {
          id: uuid(),
          organizationId: org1.id,
          name: `Customer ${i} - Microsoft`,
          email: `customer${i}@example.com`,
          phone: `555-000-${String(i).padStart(4, '0')}`,
          assignedToUserId: i <= 5 ? member1.id : i <= 10 ? member2.id : null,
        },
      });
      customers1.push(customer);
    }

    // Create customers for org2
    const customers2 = [];
    for (let i = 1; i <= 10; i++) {
      const customer = await prisma.customer.create({
        data: {
          id: uuid(),
          organizationId: org2.id,
          name: `Customer ${i} - TechStartup`,
          email: `customer${i}@techstartup.com`,
          phone: `555-100-${String(i).padStart(4, '0')}`,
          assignedToUserId: i <= 5 ? member3.id : null,
        },
      });
      customers2.push(customer);
    }

    console.log('Created customers');

    // Create notes for some customers
    for (let i = 0; i < 5; i++) {
      await prisma.note.create({
        data: {
          id: uuid(),
          customerId: customers1[i].id,
          organizationId: org1.id,
          content: `Important note about ${customers1[i].name}. This customer has great potential.`,
          createdByUserId: admin1.id,
        },
      });

      await prisma.note.create({
        data: {
          id: uuid(),
          customerId: customers1[i].id,
          organizationId: org1.id,
          content: `Follow-up: Need to discuss pricing with ${customers1[i].name}`,
          createdByUserId: member1.id,
        },
      });
    }

    console.log('✓ Created notes');

    // Create activity logs
    for (const customer of customers1) {
      await prisma.activityLog.create({
        data: {
          id: uuid(),
          organizationId: org1.id,
          entityType: 'customer',
          entityId: customer.id,
          action: 'created',
          performedByUserId: admin1.id,
          timestamp: new Date(),
        },
      });
    }

    console.log('✓ Created activity logs');

    console.log('\n Seeding completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Organization 1 (Microsoft):');
    console.log('  Admin: imdadkhanr9@gmail.com / password123');
    console.log('  Member: alice@acme.com / password123');
    console.log('  Member: bob@acme.com / password123');
    console.log('\nOrganization 2 (Tech Startup Inc):');
    console.log('  Admin: sarah@techstartup.com / password123');
    console.log('  Member: charlie@techstartup.com / password123');
  } catch (error) {
    console.error(' Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
