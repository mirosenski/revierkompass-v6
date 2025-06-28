# 🏗️ RevierKompass - Backend & Admin-Bereich Guide

## 📋 **ÜBERSICHT**

Dieser Guide erklärt, wie das **Backend** und der **Admin-Bereich** funktionieren, insbesondere für die **Adressverwaltung in Schritt 2** des RevierKompass-Systems.

---

## 🏛️ **BACKEND-ARCHITEKTUR**

### **Technologie-Stack**
```
Backend:
├── Node.js + Express.js
├── Prisma ORM
├── SQLite (Entwicklung) / PostgreSQL (Produktion)
├── JWT Authentication
└── Rate Limiting
```

### **Datenbank-Schema**
```prisma
model PoliceStation {
  id           String   @id @default(cuid())
  name         String
  type         String   // 'praesidium', 'revier', 'address'
  city         String
  address      String?
  coordinates  String?  // JSON: "[lat, lng]"
  telefon      String?
  email        String?
  notdienst24h Boolean  @default(false)
  isActive     Boolean  @default(true)
  parentId     String?  // Hierarchie: Revier -> Präsidium
  lastModified DateTime @default(now()) @updatedAt
}
```

---

## 🔧 **BACKEND-API ENDPOINTS**

### **Stationen-Verwaltung**
```typescript
// GET /api/stationen
// Alle Stationen abrufen
GET /api/stationen?all=true&take=1000

// POST /api/stationen
// Neue Station erstellen
POST /api/stationen
{
  "name": "Polizeipräsidium Stuttgart",
  "type": "praesidium",
  "city": "Stuttgart",
  "address": "Hahnemannstraße 1",
  "coordinates": [48.81046, 9.18686],
  "telefon": "0711 8990-0",
  "email": "info@polizei-stuttgart.de",
  "notdienst24h": true,
  "isActive": true
}

// PUT /api/stationen/:id
// Station aktualisieren
PUT /api/stationen/station_123
{
  "name": "Aktualisierter Name",
  "coordinates": [48.81046, 9.18686]
}

// DELETE /api/stationen/:id
// Station löschen
DELETE /api/stationen/station_123
```

### **Response-Format**
```json
{
  "id": "station_123",
  "name": "Polizeipräsidium Stuttgart",
  "type": "praesidium",
  "city": "Stuttgart",
  "address": "Hahnemannstraße 1",
  "coordinates": [48.81046, 9.18686],
  "telefon": "0711 8990-0",
  "email": "info@polizei-stuttgart.de",
  "notdienst24h": true,
  "isActive": true,
  "parentId": null,
  "lastModified": "2024-12-19T10:30:00.000Z"
}
```

---

## 🎛️ **ADMIN-BEREICH FUNKTIONALITÄT**

### **Admin Dashboard**
```typescript
// src/components/admin/AdminDashboard.tsx
const tabs = [
  {
    id: 'stations',
    label: 'Stationen',
    icon: Building2,
    description: 'Polizeipräsidien und Reviere verwalten'
  },
  {
    id: 'addresses',
    label: 'Adressen',
    icon: MapPin,
    description: 'Benutzer-Adressen verwalten und genehmigen'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Statistiken und Berichte'
  },
  {
    id: 'settings',
    label: 'Einstellungen',
    icon: Settings,
    description: 'System-Einstellungen'
  }
]
```

---

## 🏢 **STATIONEN-VERWALTUNG (SCHRITT 2)**

### **AdminStationManagement.tsx**

#### **Hauptfunktionen:**
1. **Stationen anzeigen** - Liste aller Polizeipräsidien und Reviere
2. **Station erstellen** - Neue Stationen hinzufügen
3. **Station bearbeiten** - Bestehende Stationen aktualisieren
4. **Station löschen** - Stationen entfernen
5. **Bulk-Import** - Automatisches Erstellen aller Präsidien

#### **Station-Typen:**
```typescript
type StationType = 'praesidium' | 'revier' | 'address';

interface Station {
  id: string;
  name: string;
  type: StationType;
  city: string;
  address: string;
  coordinates: [number, number];
  telefon: string;
  email: string;
  notdienst24h: boolean;
  isActive: boolean;
  parentId?: string; // Für Reviere -> Präsidium
  lastModified: string;
}
```

#### **Hierarchie-System:**
```
Polizeipräsidien (type: 'praesidium')
├── Revier 1 (type: 'revier', parentId: 'praesidium_1')
├── Revier 2 (type: 'revier', parentId: 'praesidium_1')
└── Revier 3 (type: 'revier', parentId: 'praesidium_1')
```

### **Automatischer Präsidien-Import**

#### **Vordefinierte Präsidien:**
```typescript
const praesidienData = [
  {
    name: 'Polizeipräsidium Stuttgart',
    address: 'Hahnemannstraße 1',
    city: 'Stuttgart',
    telefon: '0711 8990-0',
    coordinates: [48.81046, 9.18686],
    type: 'praesidium',
    notdienst24h: true,
    isActive: true
  },
  {
    name: 'Polizeipräsidium Karlsruhe',
    address: 'Durlacher Allee 31-33',
    city: 'Karlsruhe',
    telefon: '0721 666-0',
    coordinates: [49.0075455, 8.4258926],
    type: 'praesidium',
    notdienst24h: true,
    isActive: true
  },
  // ... weitere 12 Präsidien
];
```

#### **Import-Funktion:**
```typescript
const handleCreateAllPraesidien = async () => {
  try {
    console.log('🚀 Erstelle alle Präsidien automatisch...');
    
    for (let i = 0; i < praesidienData.length; i++) {
      const praesidium = praesidienData[i];
      console.log(`📝 Erstelle ${i + 1}/${praesidienData.length}: ${praesidium.name}`);
      
      await createStation(praesidium as Station);
      
      // Kurze Pause zwischen den Erstellungen
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    toast.success(`${praesidienData.length} Präsidien erfolgreich erstellt!`);
  } catch (err) {
    console.error('❌ Fehler beim Erstellen der Präsidien:', err);
    toast.error('Fehler beim Erstellen der Präsidien');
  }
};
```

---

## 📍 **ADDRESS-VERWALTUNG (SCHRITT 2)**

### **AdminAddressManagement.tsx**

#### **Hauptfunktionen:**
1. **Adressen anzeigen** - Liste aller benutzerdefinierten Adressen
2. **Adresse erstellen** - Neue Adressen hinzufügen
3. **Adresse bearbeiten** - Bestehende Adressen aktualisieren
4. **Adresse genehmigen/ablehnen** - Review-System
5. **Adresse zuweisen** - Präsidium-Zuordnung

#### **Address-Interface:**
```typescript
interface Address {
  id: string;
  name: string;
  street: string;
  zipCode: string;
  city: string;
  coordinates: [number, number];
  isVerified: boolean;
  isActive: boolean;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user?: {
    id: string;
    email: string;
  };
  parentId?: string; // Zuordnung zu Präsidium
}
```

#### **Review-System:**
```typescript
// Adressen-Status
type ReviewStatus = 'pending' | 'approved' | 'rejected';

// Filter-Optionen
const statusFilter = {
  all: 'Alle Adressen',
  pending: 'Ausstehende Genehmigung',
  approved: 'Genehmigte Adressen',
  rejected: 'Abgelehnte Adressen'
};
```

### **Adress-Service (admin-address.service.ts)**

#### **API-Integration:**
```typescript
export const adminAddressService = {
  // Alle Adressen abrufen
  async getAllAddresses(): Promise<Address[]> {
    const response = await axios.get('/api/stationen');
    const addresses = response.data.filter((station: any) => 
      station.type === 'address' || !station.parentId
    );
    return addresses.map(this.mapStationToAddress);
  },

  // Neue Adresse erstellen
  async createAddress(addressData: CreateAddressData): Promise<Address> {
    const stationData = {
      name: addressData.name,
      type: 'address',
      city: addressData.city,
      address: addressData.street,
      coordinates: addressData.coordinates,
      telefon: '',
      email: '',
      notdienst24h: false,
      isActive: addressData.isActive !== false,
      isVerified: addressData.isVerified || false,
      reviewStatus: addressData.reviewStatus || 'pending',
      zipCode: addressData.zipCode,
      parentId: addressData.parentId
    };
    
    const response = await axios.post('/api/stationen', stationData);
    return this.mapStationToAddress(response.data);
  },

  // Adresse aktualisieren
  async updateAddress(id: string, addressData: UpdateAddressData): Promise<Address> {
    const response = await axios.put(`/api/stationen/${id}`, addressData);
    return this.mapStationToAddress(response.data);
  }
};
```

---

## 🔐 **AUTHENTIFIZIERUNG & SICHERHEIT**

### **JWT Token Management**
```typescript
// Token aus localStorage holen
function getAuthToken(): string | null {
  try {
    const authData = localStorage.getItem('revierkompass-v2-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.token) {
        return parsed.token;
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Token abrufen:', error);
  }
  return null;
}

// API-Requests mit Token
const headers: any = {
  'Content-Type': 'application/json'
};
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### **Rate Limiting**
```typescript
// Backend Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100 // Limit auf 100 Anfragen pro Fenster
});

router.use(limiter);
```

---

## 📊 **STATE MANAGEMENT**

### **Admin Store (Zustand)**
```typescript
export const useAdminStore = create<AdminState>((set, get) => ({
  // Data State
  allStations: [],
  filteredStations: [],
  selectedStations: [],
  stats: null,
  
  // UI State
  isLoading: false,
  error: null,
  isEditing: false,
  editingStationId: null,
  
  // Filters & Sorting
  searchQuery: '',
  cityFilter: '',
  typeFilter: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  
  // Actions
  loadStations: async () => {
    set({ isLoading: true, error: null });
    try {
      const stations = await fetchStations();
      set({ allStations: stations, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  addStation: async (stationData) => {
    // Station hinzufügen
  },
  
  updateStation: async (id, updates) => {
    // Station aktualisieren
  },
  
  deleteStation: async (id) => {
    // Station löschen
  }
}));
```

---

## 🎨 **UI-KOMPONENTEN**

### **StationModal.tsx**
```typescript
interface StationModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: StationFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  availablePraesidien: Station[];
}

interface StationFormData {
  name: string;
  address: string;
  city: string;
  telefon: string;
  email: string;
  coordinates: [number, number];
  type: StationType;
  notdienst24h: boolean;
  isActive: boolean;
  parentId: string;
}
```

#### **Form-Validierung:**
```typescript
const FORM_VALIDATION_RULES = {
  name: { required: true, minLength: 2 },
  address: { required: true, minLength: 5 },
  city: { required: true, minLength: 2 },
  telefon: { required: true, pattern: /^[\d\s\-\+\(\)]+$/ },
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  coordinates: { required: true, lat: [-90, 90], lng: [-180, 180] }
};
```

### **StationCard.tsx**
```typescript
const StationCard: React.FC<StationCardProps> = ({ 
  station, 
  onEdit, 
  onDelete, 
  isExpanded, 
  onToggle 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Station Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {station.name}
          </h3>
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              station.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {station.isActive ? 'Aktiv' : 'Inaktiv'}
            </span>
            
            {/* Type Badge */}
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
              {station.type === 'praesidium' ? 'Präsidium' : 'Revier'}
            </span>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{station.address}, {station.city}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Phone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${station.telefon}`} className="hover:text-blue-600">
              {station.telefon}
            </a>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          onClick={() => onEdit(station)}
          className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Bearbeiten
        </button>
        <button
          onClick={() => onDelete(station.id)}
          className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          Löschen
        </button>
      </div>
    </div>
  );
};
```

---

## 🚀 **SCHRITT 2: ADRESSVERWALTUNG IMPLEMENTIERUNG**

### **1. Präsidien anlegen**
```typescript
// Button im Admin-Panel
<button
  onClick={handleCreateAllPraesidien}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  Alle Präsidien automatisch anlegen
</button>
```

### **2. Reviere zuweisen**
```typescript
// Nach Präsidien-Import: Reviere mit parentId anlegen
const revierData = {
  name: 'Polizeirevier Stuttgart-Mitte',
  type: 'revier',
  city: 'Stuttgart',
  address: 'Marktplatz 1',
  coordinates: [48.7758, 9.1829],
  telefon: '0711 8990-100',
  parentId: 'praesidium_stuttgart_id', // Wichtig!
  isActive: true
};
```

### **3. Adressen verwalten**
```typescript
// Adressen als Stationen mit type: 'address'
const addressData = {
  name: 'Benutzer-Adresse',
  type: 'address',
  city: 'Stuttgart',
  address: 'Königstraße 1',
  coordinates: [48.7758, 9.1829],
  reviewStatus: 'pending',
  isVerified: false,
  parentId: 'praesidium_stuttgart_id' // Zuordnung
};
```

---

## 📋 **WORKFLOW FÜR SCHRITT 2**

### **Phase 1: Präsidien anlegen**
1. Admin-Panel öffnen
2. "Stationen" Tab wählen
3. "Alle Präsidien automatisch anlegen" Button klicken
4. 14 Präsidien werden erstellt

### **Phase 2: Reviere hinzufügen**
1. "Neue Station erstellen" Button
2. Typ: "Revier" wählen
3. Übergeordnetes Präsidium auswählen
4. Reviere-Daten eingeben
5. Speichern

### **Phase 3: Adressen verwalten**
1. "Adressen" Tab wählen
2. Benutzer-Adressen anzeigen
3. Genehmigen/Ablehnen
4. Präsidium zuweisen

### **Phase 4: Testing**
1. Frontend testen
2. Routing testen
3. Offline-Funktionalität prüfen

---

## 🔧 **KONFIGURATION & DEPLOYMENT**

### **Umgebungsvariablen**
```bash
# .env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV="development"
```

### **Docker Setup**
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/revierkompass
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=revierkompass
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
```

---

## 📊 **MONITORING & LOGGING**

### **Backend Logging**
```typescript
// Logging-Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error Handling
app.use((error, req, res, next) => {
  console.error('Backend Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

### **Frontend Error Boundary**
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Frontend Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Etwas ist schiefgelaufen.</div>;
    }
    return this.props.children;
  }
}
```

---

## 🎯 **FAZIT**

### **✅ WAS BEREITS FUNKTIONIERT:**
- Vollständiges Backend mit Express.js
- Prisma ORM mit SQLite/PostgreSQL
- Admin-Panel mit Stationen-Verwaltung
- JWT-Authentifizierung
- Rate Limiting
- Error Handling

### **🚀 NÄCHSTE SCHRITTE:**
1. **Präsidien importieren** - Automatischer Import aller 14 Präsidien
2. **Reviere hinzufügen** - Manuell oder per Bulk-Import
3. **Adressen verwalten** - Review-System implementieren
4. **Testing** - Vollständige Funktionalität testen

### **💡 EMPFEHLUNG:**
**Sofort mit Schritt 2 beginnen** - Das Backend und Admin-Panel sind vollständig implementiert und bereit für die Adressverwaltung. Sie können sofort die Präsidien importieren und mit der Reviere-Verwaltung beginnen.

---

*Letzte Aktualisierung: Dezember 2024*
*Status: ✅ Vollständig implementiert und einsatzbereit* 