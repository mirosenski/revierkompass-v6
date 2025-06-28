export const pforzheimAddresses = [
    {
        name: 'Polizeipräsidium Pforzheim',
        address: 'Bahnhofstr. 13',
        city: 'Pforzheim',
        coordinates: [48.893076, 8.7007708],
        type: 'praesidium',
        telefon: '+49 (0) 7231 / 186-0',
    },
    {
        name: 'Polizeirevier Mühlacker',
        address: 'Hindenburgstraße 100',
        city: 'Mühlacker',
        coordinates: [48.95231, 8.84832],
        type: 'revier',
        telefon: '07041 9693-0',
    },
    {
        name: 'Polizeirevier Nagold',
        address: 'Oberamteistraße 6',
        city: 'Nagold',
        coordinates: [48.552021, 8.722196],
        type: 'revier',
        telefon: '07452 9305-0',
    },
    {
        name: 'Polizeirevier Neuenbürg',
        address: 'Bahnhofstraße 12',
        city: 'Neuenbürg',
        coordinates: [48.84722, 8.58889],
        type: 'revier',
        telefon: '07082 7912-311',
    },
    {
        name: 'Polizeirevier Pforzheim-Nord',
        address: 'Bahnhofstraße 13',
        city: 'Pforzheim',
        coordinates: [48.893107, 8.700933],
        type: 'revier',
        telefon: '07231 186-3211',
    },
    {
        name: 'Polizeirevier Pforzheim-Süd',
        address: 'Schwebelstraße 10',
        city: 'Pforzheim',
        coordinates: [48.891099, 8.684557],
        type: 'revier',
        telefon: '07231 186-3311',
    },
    {
        name: 'Polizeirevier Freudenstadt',
        address: 'Marktplatz 47',
        city: 'Freudenstadt',
        coordinates: [48.464357, 8.409372],
        type: 'revier',
        telefon: '07441 536-310',
    },
    {
        name: 'Polizeirevier Horb am Neckar',
        address: 'Neckarstraße 33',
        city: 'Horb am Neckar',
        coordinates: [48.444220, 8.690874],
        type: 'revier',
        telefon: '07451 96-0',
    },
];
export const createAllPforzheimAddresses = async () => {
    const { toast } = await import('react-hot-toast');
    const { createStation } = await import('@/services/api/backend-api.service');
    try {
        let createdCount = 0;
        let errorCount = 0;
        let praesidiumId = '';
        const loadingToast = toast.loading('Erstelle Pforzheim-Stationen...');
        // Erstelle zuerst das Präsidium
        const praesidium = pforzheimAddresses.find(entry => entry.type === 'praesidium');
        if (praesidium) {
            try {
                const praesidiumData = {
                    name: praesidium.name,
                    type: praesidium.type,
                    city: praesidium.city,
                    address: praesidium.address,
                    coordinates: praesidium.coordinates,
                    telefon: praesidium.telefon,
                    email: 'pforzheim.pp@polizei.bwl.de',
                    notdienst24h: false,
                    isActive: true,
                };
                console.log('🔄 Erstelle Präsidium:', praesidium.name);
                const response = await createStation(praesidiumData);
                praesidiumId = response.id;
                createdCount++;
                console.log('✅ Präsidium erstellt:', response);
                toast.loading(`Erstelle Pforzheim-Stationen... (${createdCount}/${pforzheimAddresses.length})`, { id: loadingToast });
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            catch (error) {
                console.error(`Fehler beim Erstellen des Präsidiums ${praesidium.name}:`, error);
                errorCount++;
            }
        }
        // Erstelle dann alle Reviere mit parentId
        for (const entry of pforzheimAddresses.filter(e => e.type === 'revier')) {
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
                console.log('🔄 Erstelle Revier:', entry.name);
                await createStation(revierData);
                createdCount++;
                toast.loading(`Erstelle Pforzheim-Stationen... (${createdCount}/${pforzheimAddresses.length})`, { id: loadingToast });
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            catch (error) {
                console.error(`Fehler beim Erstellen von ${entry.name}:`, error);
                errorCount++;
            }
        }
        toast.dismiss(loadingToast);
        if (createdCount > 0) {
            toast.success(`✅ ${createdCount} Stationen für Polizeipräsidium Pforzheim erfolgreich erstellt!${errorCount > 0 ? ` (${errorCount} Fehler)` : ''}`);
        }
        else {
            toast.error('❌ Keine Stationen konnten erstellt werden');
        }
        return createdCount;
    }
    catch (error) {
        console.error('Fehler beim Erstellen der Pforzheim-Stationen:', error);
        toast.error('❌ Fehler beim Erstellen der Stationen');
        throw error;
    }
};
