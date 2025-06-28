const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const prisma = new PrismaClient();
  try {
    const jsonPath = path.join(__dirname, 'data', 'polizeistationen.json');
    const stations = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const station of stations) {
      await prisma.policeStation.create({
        data: {
          ...station,
          coordinates: station.coordinates ? JSON.stringify(station.coordinates) : null
        }
      });
    }
    console.log(`✅ ${stations.length} Stationen migriert`);
  } catch (error) {
    console.error('Fehler bei Migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
