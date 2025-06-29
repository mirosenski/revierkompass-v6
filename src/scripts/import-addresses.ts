import { stuttgartAddresses, createAllStuttgartAddresses } from '../data/stuttgart-addresses';
import { karlsruheAddresses } from '../data/karlsruhe-addresses';
import { mannheimAddresses } from '../data/mannheim-addresses';
import { freiburgAddresses } from '../data/freiburg-addresses';
import { heilbronnAddresses } from '../data/heilbronn-addresses';
import { konstanzAddresses } from '../data/konstanz-addresses';
import { ludwigsburgAddresses } from '../data/ludwigsburg-addresses';
import { offenburgAddresses } from '../data/offenburg-addresses';
import { pforzheimAddresses } from '../data/pforzheim-addresses';
import { ravensburgAddresses } from '../data/ravensburg-addresses';
import { reutlingenAddresses } from '../data/reutlingen-addresses';
import { ulmAddresses } from '../data/ulm-addresses';
import { aalenAddresses } from '../data/aalen-addresses';

interface AddressData {
  name: string;
  address: string;
  city: string;
  coordinates: [number, number];
  type: 'praesidium' | 'revier';
  telefon: string;
  parentId?: string;
}

interface CityData {
  name: string;
  addresses: AddressData[];
  createFunction?: () => Promise<number>;
}

const cityData: CityData[] = [
  { name: 'Stuttgart', addresses: stuttgartAddresses, createFunction: createAllStuttgartAddresses },
  { name: 'Karlsruhe', addresses: karlsruheAddresses },
  { name: 'Mannheim', addresses: mannheimAddresses },
  { name: 'Freiburg', addresses: freiburgAddresses },
  { name: 'Heilbronn', addresses: heilbronnAddresses },
  { name: 'Konstanz', addresses: konstanzAddresses },
  { name: 'Ludwigsburg', addresses: ludwigsburgAddresses },
  { name: 'Offenburg', addresses: offenburgAddresses },
  { name: 'Pforzheim', addresses: pforzheimAddresses },
  { name: 'Ravensburg', addresses: ravensburgAddresses },
  { name: 'Reutlingen', addresses: reutlingenAddresses },
  { name: 'Ulm', addresses: ulmAddresses },
  { name: 'Aalen', addresses: aalenAddresses },
];

export const importAllAddresses = async () => {
  const { toast } = await import('react-hot-toast');
  const { createStation } = await import('@/services/api/backend-api.service');

  try {
    let totalCreated = 0;
    let totalErrors = 0;
    const loadingToast = toast.loading('Importiere alle Polizeistationen...');

    for (const city of cityData) {
      try {
        console.log(`🔄 Importiere ${city.name}...`);
        
        if (city.createFunction) {
          // Verwende spezielle Funktion falls vorhanden (z.B. für Stuttgart)
          const created = await city.createFunction();
          totalCreated += created;
        } else {
          // Standard-Import für andere Städte
          let createdCount = 0;
          let errorCount = 0;
          let praesidiumId = '';

          // Erstelle zuerst das Präsidium
          const praesidium = city.addresses.find(entry => entry.type === 'praesidium');
          if (praesidium) {
            try {
              const praesidiumData = {
                name: praesidium.name,
                type: praesidium.type,
                city: praesidium.city,
                address: praesidium.address,
                coordinates: praesidium.coordinates,
                telefon: praesidium.telefon,
                email: `${praesidium.city.toLowerCase().replace(/\s+/g, '')}@polizei.bwl.de`,
                notdienst24h: false,
                isActive: true,
              };
              
              console.log(`🔄 Erstelle Präsidium ${city.name}:`, praesidium.name);
              const response = await createStation(praesidiumData);
              
              praesidiumId = response.id;
              createdCount++;
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (error) {
              console.error(`Fehler beim Erstellen des Präsidiums ${praesidium.name}:`, error);
              errorCount++;
            }
          }

          // Erstelle dann alle Reviere mit parentId
          for (const entry of city.addresses.filter(e => e.type === 'revier')) {
            try {
              const revierData = {
                name: entry.name,
                type: entry.type,
                city: entry.city,
                address: entry.address,
                coordinates: entry.coordinates,
                telefon: entry.telefon,
                email: `${entry.city.toLowerCase().replace(/\s+/g, '')}@polizei.bwl.de`,
                notdienst24h: false,
                isActive: true,
                parentId: praesidiumId,
              };
              
              console.log(`🔄 Erstelle Revier ${city.name}:`, entry.name);
              await createStation(revierData);
              
              createdCount++;
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (error) {
              console.error(`Fehler beim Erstellen von ${entry.name}:`, error);
              errorCount++;
            }
          }

          totalCreated += createdCount;
          totalErrors += errorCount;
        }

        toast.loading(`Importiere alle Polizeistationen... (${totalCreated} erstellt)`, { id: loadingToast });
        
      } catch (error) {
        console.error(`Fehler beim Importieren von ${city.name}:`, error);
        totalErrors++;
      }
    }

    toast.dismiss(loadingToast);
    
    if (totalCreated > 0) {
      toast.success(`✅ ${totalCreated} Polizeistationen erfolgreich importiert!${totalErrors > 0 ? ` (${totalErrors} Fehler)` : ''}`);
    } else {
      toast.error('❌ Keine Stationen konnten importiert werden');
    }
    
    return { totalCreated, totalErrors };
    
  } catch (error) {
    console.error('Fehler beim Importieren aller Adressen:', error);
    toast.error('❌ Fehler beim Importieren der Stationen');
    throw error;
  }
};

// Funktion zum Anzeigen der Statistiken
export const showAddressStats = () => {
  console.log('📊 Adress-Statistiken:');
  let totalAddresses = 0;
  
  for (const city of cityData) {
    const praesidien = city.addresses.filter(a => a.type === 'praesidium').length;
    const reviere = city.addresses.filter(a => a.type === 'revier').length;
    totalAddresses += city.addresses.length;
    
    console.log(`  ${city.name}: ${praesidien} Präsidien, ${reviere} Reviere (${city.addresses.length} total)`);
  }
  
  console.log(`📊 Gesamt: ${totalAddresses} Adressen in ${cityData.length} Städten`);
  return { totalAddresses, cityCount: cityData.length };
};

// Funktion zum Testen der API-Verbindung
export const testAPIConnection = async () => {
  try {
    const response = await fetch('/api/stationen');
    if (response.ok) {
      const stations = await response.json();
      console.log(`✅ API-Verbindung OK. Aktuell ${stations.length} Stationen in der Datenbank.`);
      return stations.length;
    } else {
      console.error('❌ API-Verbindung fehlgeschlagen:', response.status);
      return 0;
    }
  } catch (error) {
    console.error('❌ API-Verbindung fehlgeschlagen:', error);
    return 0;
  }
}; 