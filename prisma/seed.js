// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create the event
  const event = await prisma.event.create({
    data: {
      name: "Annual Festival 2025",
      description: "Our signature three-day festival with performances, activities, and more!",
      startDate: new Date("2025-06-26T10:00:00Z"), // Thursday
      endDate: new Date("2025-06-28T23:00:00Z"),   // Saturday
    }
  });

  console.log('Created event:', event.id);

  // Create event days
  const days = await Promise.all([
    prisma.eventDay.create({
      data: {
        name: "Thursday",
        date: new Date("2025-06-26T10:00:00Z"),
        eventId: event.id
      }
    }),
    prisma.eventDay.create({
      data: {
        name: "Friday",
        date: new Date("2025-06-27T10:00:00Z"),
        eventId: event.id
      }
    }),
    prisma.eventDay.create({
      data: {
        name: "Saturday",
        date: new Date("2025-06-28T10:00:00Z"),
        eventId: event.id
      }
    })
  ]);

  console.log('Created event days');

  // Create VIP sections
  const vipSectionNames = ["101", "102", "103", "104"];
  const vipSections = await Promise.all(
    vipSectionNames.map(name =>
      prisma.section.create({
        data: {
          name,
          type: "VIP",
          description: "VIP section with premium view and 3-day access",
          eventId: event.id
        }
      })
    )
  );

  console.log('Created VIP sections');

  // Create GA sections
  const gaSectionNames = ["201", "202", "203", "204"];
  const gaSections = await Promise.all(
    gaSectionNames.map(name =>
      prisma.section.create({
        data: {
          name,
          type: "GA",
          description: "General Admission section",
          eventId: event.id
        }
      })
    )
  );

  console.log('Created GA sections');

  // Create VIP rows and seats
  for (const section of vipSections) {
    console.log(`Creating rows and seats for VIP section ${section.name}...`);
    
    for (let rowNum = 1; rowNum <= 15; rowNum++) {
      const seatsInRow = 10 + Math.floor(rowNum * 1.5);
      
      const row = await prisma.sectionRow.create({
        data: {
          rowNumber: rowNum,
          sectionId: section.id,
        }
      });

      const seatPromises = [];
      for (let seatNum = 1; seatNum <= seatsInRow; seatNum++) {
        seatPromises.push(
          prisma.seat.create({
            data: {
              seatNumber: seatNum,
              rowId: row.id,
              price: 135,
              threeDay: true,
              available: true
            }
          })
        );
      }
      await Promise.all(seatPromises);
    }
  }

  console.log('Created VIP rows and seats');

  // Create GA rows and seats
  for (const section of gaSections) {
    console.log(`Creating rows and seats for GA section ${section.name}...`);
    
    for (let rowNum = 1; rowNum <= 30; rowNum++) {
      const row = await prisma.sectionRow.create({
        data: {
          rowNumber: rowNum,
          sectionId: section.id,
        }
      });

      const seatPromises = [];
      for (let seatNum = 1; seatNum <= 15; seatNum++) {
        seatPromises.push(
          prisma.seat.create({
            data: {
              seatNumber: seatNum,
              rowId: row.id,
              price: 35,
              threeDay: false,
              available: true
            }
          })
        );
      }
      await Promise.all(seatPromises);
    }
  }

  console.log('Created GA rows and seats');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
