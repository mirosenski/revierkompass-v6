const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const prisma = new PrismaClient();
  try {
    const jsonPath = path.join(__dirname, 'data', 'polizeistationen.json');
    const stations = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let created = 0;
    let skipped = 0;
    
    for (const station of stations) {
      try {
        await prisma.policeStation.create({
          data: {
            ...station,
            coordinates: station.coordinates ? JSON.stringify(station.coordinates) : null
          }
        });
        created++;
      } catch (error) {
        if (error.code === 'P2002') {
          // Duplikat - überspringe
          skipped++;
        } else {
          console.error('Fehler beim Erstellen der Station:', station.name, error);
        }
      }
    }
    
    console.log(`✅ ${created} neue Stationen erstellt, ${skipped} übersprungen`);
  } catch (error) {
    console.error('Fehler bei Migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
