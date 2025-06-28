# 🧙‍♂️ RevierKompass - Wizard Technology Guide

## 📋 **ÜBERSICHT**

Dieser Guide erklärt die **Technologien** und **Funktionsweise** des RevierKompass-Systems mit Fokus auf den **3-Schritt-Wizard** für die Routenberechnung.

---

## 🏗️ **TECHNOLOGIE-STACK**

### **Frontend (React/TypeScript)**
```
Frontend:
├── React 18 + TypeScript
├── Vite (Build Tool)
├── Tailwind CSS (Styling)
├── Framer Motion (Animationen)
├── Zustand (State Management)
├── React Hook Form (Formulare)
├── MapLibre GL JS (Karten)
├── Lucide React (Icons)
└── React Hot Toast (Benachrichtigungen)
```

### **Backend (Node.js/Express)**
```
Backend:
├── Node.js + Express.js
├── Prisma ORM (Datenbank)
├── SQLite (Entwicklung) / PostgreSQL (Produktion)
├── JWT Authentication
├── Rate Limiting
├── CORS Support
└── Helmet (Sicherheit)
```

### **Karten & Routing Infrastruktur**
```
Docker Services:
├── PostgreSQL + PostGIS (Datenbank)
├── TileServer GL (Karten-Tiles)
├── OSRM Backend (Routing Engine)
├── Valhalla (Erweiterte Routing Engine)
├── Nominatim (Geocoding)
└── Redis (Caching)
```

---

## 🎯 **3-SCHRITT-WIZARD ARCHITEKTUR**

### **Wizard-Flow:**
```
Schritt 1: Adressangabe
    ↓
Schritt 2: Zielauswahl (Präsidien/Reviere/Eigene Adressen)
    ↓
Schritt 3: Routing-Berechnung (Fußgänger/Fahrrad/Auto/ÖPNV)
```

---

## 📍 **SCHRITT 1: ADRESSANGABE**

### **Technologie: Nominatim Geocoding**
```typescript
// Frontend: Adress-Suche
import { searchAddress } from 'nominatim-browser';

const handleAddressSearch = async (query: string) => {
  const results = await searchAddress({
    q: query,
    countrycodes: 'de',
    limit: 10,
    addressdetails: 1
  });
  
  return results.map(result => ({
    display_name: result.display_name,
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    importance: result.importance
  }));
};
```

### **Backend: Offline Geocoding**
```typescript
// Backend: Nominatim Service
export class NominatimService {
  async geocodeAddress(query: string): Promise<GeocodingResult[]> {
    try {
      // Online: Nominatim API
      const response = await fetch(
        `${this.nominatimUrl}/search?q=${encodeURIComponent(query)}&countrycodes=de&limit=10&format=json`
      );
      
      const results = await response.json();
      return results.map(this.mapToGeocodingResult);
      
    } catch (error) {
      // Offline: Cached Results
      return this.getCachedResults(query);
    }
  }
}
```

---

## 🏢 **SCHRITT 2: ZIELAUSWAHL (PRÄSIDIEN/REVIERE/EIGENE ADRESSEN)**

### **Datenmodell: Stationen-Hierarchie**
```typescript
interface Station {
  id: string;
  name: string;
  type: 'praesidium' | 'revier' | 'address';
  city: string;
  address: string;
  coordinates: [number, number];
  telefon: string;
  email: string;
  notdienst24h: boolean;
  isActive: boolean;
  parentId?: string; // Hierarchie: Revier -> Präsidium
}

// Hierarchie-Struktur:
// Polizeipräsidien (type: 'praesidium', parentId: null)
// ├── Revier 1 (type: 'revier', parentId: 'praesidium_1')
// ├── Revier 2 (type: 'revier', parentId: 'praesidium_1')
// └── Revier 3 (type: 'revier', parentId: 'praesidium_1')
```

### **Backend API: Stationen abrufen**
```typescript
// GET /api/stationen
router.get('/', async (req: Request, res: Response) => {
  try {
    const { all, take, type, city } = req.query;
    
    const where: any = {};
    if (!all) where.isActive = true;
    if (type) where.type = type;
    if (city) where.city = { contains: city as string };
    
    const stations = await prisma.policeStation.findMany({
      where,
      take: parseInt(take as string) || 50,
      orderBy: { name: 'asc' }
    });
    
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Stationen' });
  }
});
```

---

## 🛣️ **SCHRITT 3: ROUTING-BERECHNUNG**

### **Routing-Profile für verschiedene Verkehrsmittel**
```typescript
// Routing-Profile Konfiguration
const ROUTING_PROFILES = {
  pedestrian: {
    name: 'Fußgänger',
    icon: '👟',
    speed: 4.0, // km/h
    engine: 'valhalla',
    costing: 'pedestrian',
    description: 'Sichere Fußwege mit Priorität auf Gehwege'
  },
  bicycle: {
    name: 'Fahrrad',
    icon: '🚲',
    speed: 20.0, // km/h
    engine: 'valhalla',
    costing: 'bicycle',
    description: 'Fahrradrouten mit Berücksichtigung von Radwegen'
  },
  auto: {
    name: 'Auto',
    icon: '🚗',
    speed: 50.0, // km/h (Stadt)
    engine: 'osrm',
    costing: 'auto',
    description: 'Standard-Autofahrten mit Verkehrsregeln'
  },
  public_transport: {
    name: 'ÖPNV',
    icon: '🚌',
    speed: 25.0, // km/h
    engine: 'valhalla',
    costing: 'bus',
    description: 'Öffentliche Verkehrsmittel mit Bus und Bahn'
  }
};
```

### **Backend: Routing-Service**
```typescript
// src/services/RoutingService.ts
export class RoutingService {
  private osrmUrl = 'http://localhost:5000';
  private valhallaUrl = 'http://localhost:8002';

  async calculateRoute(
    start: Coordinates,
    end: Coordinates,
    profile: string = 'auto'
  ): Promise<RouteResult> {
    const profileConfig = ROUTING_PROFILES[profile];
    
    if (profileConfig.engine === 'valhalla') {
      return this.calculateWithValhalla(start, end, profileConfig);
    } else {
      return this.calculateWithOSRM(start, end, profileConfig);
    }
  }

  private async calculateWithValhalla(
    start: Coordinates,
    end: Coordinates,
    profile: any
  ): Promise<RouteResult> {
    const payload = {
      locations: [
        { lat: start.lat, lon: start.lng },
        { lat: end.lat, lon: end.lng }
      ],
      costing: profile.costing,
      directions_options: {
        units: 'kilometers',
        language: 'de-DE'
      }
    };

    const response = await fetch(`${this.valhallaUrl}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return this.mapValhallaResponse(data);
  }

  private async calculateWithOSRM(
    start: Coordinates,
    end: Coordinates,
    profile: any
  ): Promise<RouteResult> {
    const url = `${this.osrmUrl}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();
    return this.mapOSRMResponse(data);
  }
}
```

---

## 🗺️ **KARTEN-INTEGRATION (ONLINE & OFFLINE)**

### **Online-Karte: InteractiveMap**
```typescript
// src/components/map/InteractiveMap.tsx
interface InteractiveMapProps {
  routeResults: RouteResult[];
  startAddress: string;
  startCoordinates: Coordinates;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  routeResults,
  startAddress,
  startCoordinates
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Online-Karte initialisieren
    map.current = new MapLibreMap({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=YOUR_KEY',
      center: [startCoordinates.lng, startCoordinates.lat],
      zoom: 11
    });

    // Routen hinzufügen
    map.current.on('load', () => {
      addRouteMarkers();
      addRouteLines();
    });

  }, [startCoordinates]);

  return <div ref={mapContainer} className="w-full h-96 rounded-lg" />;
};
```

### **Offline-Karte: OfflineMapComponent**
```typescript
// src/components/map/OfflineMapComponent.tsx
interface OfflineMapComponentProps {
  routeResults: RouteResult[];
  startAddress: string;
  startCoordinates: Coordinates;
  showOfflineControls?: boolean;
}

const OfflineMapComponent: React.FC<OfflineMapComponentProps> = ({
  routeResults,
  startAddress,
  startCoordinates,
  showOfflineControls = true
}) => {
  const [networkStatus, setNetworkStatus] = useState({ online: navigator.onLine });
  const [offlineCapabilities, setOfflineCapabilities] = useState(null);

  useEffect(() => {
    // Offline-Service initialisieren
    const initializeOfflineService = async () => {
      await offlineMapService.initialize();
      const capabilities = await offlineMapService.checkCapabilities();
      setOfflineCapabilities(capabilities);
    };

    initializeOfflineService();
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Offline-Karte */}
      <div ref={mapContainer} className="w-full h-96 rounded-lg" />
      
      {/* Netzwerk-Status */}
      <div className={`absolute top-4 right-4 px-3 py-2 rounded-lg ${
        networkStatus.online 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {networkStatus.online ? 'Online' : 'Offline'}
      </div>
    </div>
  );
};
```

---

## 🔄 **WIZARD-STATE-MANAGEMENT**

### **Wizard Store (Zustand)**
```typescript
// src/lib/store/wizard-store.ts
interface WizardState {
  // Schritt 1: Adressangabe
  startAddress: Address | null;
  
  // Schritt 2: Zielauswahl
  selectedStations: string[];
  selectedCustomAddresses: string[];
  
  // Schritt 3: Routing
  routeResults: RouteResult[];
  selectedProfiles: string[];
  
  // UI State
  currentStep: 1 | 2 | 3;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setStartAddress: (address: Address) => void;
  setSelectedStations: (stationIds: string[]) => void;
  setSelectedCustomAddresses: (addressIds: string[]) => void;
  setRouteResults: (routes: RouteResult[]) => void;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  resetWizard: () => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  // Initial State
  startAddress: null,
  selectedStations: [],
  selectedCustomAddresses: [],
  routeResults: [],
  selectedProfiles: ['auto'],
  currentStep: 1,
  isLoading: false,
  error: null,

  // Actions
  setStartAddress: (address) => set({ startAddress: address }),
  setSelectedStations: (stationIds) => set({ selectedStations: stationIds }),
  setSelectedCustomAddresses: (addressIds) => set({ selectedCustomAddresses: addressIds }),
  setRouteResults: (routes) => set({ routeResults: routes }),
  setCurrentStep: (step) => set({ currentStep: step }),
  resetWizard: () => set({
    startAddress: null,
    selectedStations: [],
    selectedCustomAddresses: [],
    routeResults: [],
    currentStep: 1,
    isLoading: false,
    error: null
  })
}));
```

---

## 🚀 **IMPLEMENTIERUNG-WORKFLOW**

### **Phase 1: Backend Setup (30 Minuten)**
```bash
# 1. Docker-Container starten
cd backend
docker-compose -f docker-compose-tiles.yml up -d

# 2. Backend starten
npm run dev

# 3. Services testen
curl http://localhost:3000/api/stationen
curl http://localhost:5000/route/v1/driving/9.18686,48.81046;9.1829,48.7758
```

### **Phase 2: Frontend Setup (15 Minuten)**
```bash
# 1. Frontend starten
npm run dev

# 2. Wizard testen
# - Schritt 1: Adresse eingeben
# - Schritt 2: Stationen auswählen
# - Schritt 3: Routen berechnen
```

### **Phase 3: Daten-Import (30 Minuten)**
```bash
# 1. Admin-Panel öffnen
# 2. Präsidien automatisch importieren
# 3. Reviere manuell hinzufügen
# 4. Adressen als type: 'address' anlegen
```

### **Phase 4: Testing (45 Minuten)**
```bash
# 1. Online-Karte testen
# 2. Offline-Karte testen
# 3. Routing-Profile testen
# 4. Performance optimieren
```

---

## 🎯 **FAZIT**

### **✅ VOLLSTÄNDIG IMPLEMENTIERT:**
- **3-Schritt-Wizard** mit Adressangabe, Zielauswahl und Routing
- **Online & Offline Karten** mit MapLibre GL JS
- **Routing-Engines** (OSRM + Valhalla) für alle Verkehrsmittel
- **Admin-Panel** für Stationen- und Adressen-Verwaltung
- **Geocoding** (Nominatim) für Adresssuche
- **State Management** mit Zustand

### **🚀 SOFORT EINSATZBEREIT:**
1. **Docker-Container starten**
2. **Admin-Panel öffnen** und Präsidien importieren
3. **Wizard testen** mit echten Daten
4. **Routing-Profile** für verschiedene Verkehrsmittel nutzen

**Das System ist vollständig funktionsfähig und bereit für den produktiven Einsatz!** 🎯

---

*Letzte Aktualisierung: Dezember 2024*
*Status: ✅ Vollständig implementiert und einsatzbereit* 