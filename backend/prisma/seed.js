const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create Venue
  const venue = await prisma.venue.create({
    data: {
      name: 'Grand Sentinel Hotel',
    },
  });

  // Create Floors
  const floors = [
    { level: 0, name: 'Lobby' },
    { level: 1, name: 'First Floor' },
    { level: 5, name: 'Fifth Floor' },
    { level: 12, name: 'Twelfth Floor' },
    { level: -1, name: 'Basement 1' },
    { level: -2, name: 'Basement 2' },
  ];

  for (const f of floors) {
    const floor = await prisma.floor.create({
      data: {
        level: f.level,
        name: f.name,
        venueId: venue.id,
      },
    });

    // Create Zones for each floor
    const zones = ['Zone A', 'Zone B', 'Zone C'];
    for (const z of zones) {
      await prisma.zone.create({
        data: {
          name: z,
          description: `Security Zone ${z} on ${f.name}`,
          floorId: floor.id,
        },
      });
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
