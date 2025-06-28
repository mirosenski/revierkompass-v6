# 📁 RevierKompass - Analyse-Dateien Liste

## 🎯 **ZIEL: Vollständige Analyse der Karten- und Routing-Infrastruktur**

Diese Liste enthält alle wichtigen Dateien, die Sie für eine detaillierte Analyse und weitere Informationen benötigen.

---

## 🗺️ **FRONTEND KARTEN-KOMPONENTEN**

### **Hauptkomponenten**
```
src/components/map/
├── InteractiveMap.tsx          # Online-Kartenkomponente
├── OfflineMapComponent.tsx     # Offline-Kartenkomponente
└── [weitere Map-Komponenten]
```

### **Services & Utilities**
```
src/lib/services/
├── offline-map-service.ts      # Offline-Map Service
├── routing-service.ts          # Routing Service
└── [weitere Services]
```

### **Store & State Management**
```
src/lib/store/
├── app-store.ts               # Haupt-Store mit RouteResult Interface
└── [weitere Store-Dateien]
```

---

## 🔧 **BACKEND KARTEN-INFRASTRUKTUR**

### **Services**
```
backend/src/services/
├── OfflineMapService.ts        # Haupt-Offline-Map Service
└── [weitere Service-Dateien]
```

### **Routes & API**
```
backend/src/routes/
├── maps.ts                     # Karten-API Endpoints
└── [weitere Route-Dateien]
```

### **Middleware**
```
backend/src/middleware/
├── auth.ts                     # Authentifizierung
├── rateLimiter.ts             # Rate Limiting
└── [weitere Middleware]
```

---

## 🐳 **DOCKER & INFRASTRUKTUR**

### **Docker Compose**
```
backend/
├── docker-compose.yml          # Basis-Infrastruktur
├── docker-compose-tiles.yml    # Vollständige Offline-Infrastruktur
└── Dockerfile                  # Backend-Container
```

### **Konfigurationsdateien**
```
backend/config/
├── tileserver-config.json      # TileServer Konfiguration
├── valhalla.json              # Valhalla Routing-Konfiguration
└── styles/
    ├── bw-police.json         # Polizei-Kartenstil
    ├── bw-basic.json          # Grundkarte
    └── bw-satellite.json      # Satellitenkarte
```

---

## 🗄️ **DATENBANK & SCHEMA**

### **Prisma Schema**
```
backend/prisma/
├── schema.prisma              # Datenbankschema
├── migrations/                # Datenbank-Migrationen
└── [weitere DB-Dateien]
```

### **Daten-Import Scripts**
```
backend/src/scripts/
├── import-stations-from-excel.ts  # Stationen-Import
└── [weitere Import-Scripts]
```

---

## 🔄 **SERVICE WORKER & OFFLINE-FUNKTIONALITÄT**

### **Service Worker**
```
public/
├── sw-maps.js                 # Maps Service Worker
└── [weitere SW-Dateien]
```

### **Proxy & Caching**
```
proxy.js                       # Routing-Proxy
```

---

## 📦 **PACKAGE & DEPENDENCIES**

### **Frontend Dependencies**
```
package.json                   # Frontend Dependencies
├── maplibre-gl: ^5.6.0        # Karten-Bibliothek
├── nominatim-browser: ^2.1.0  # Geocoding
└── [weitere Map-Dependencies]
```

### **Backend Dependencies**
```
backend/package.json           # Backend Dependencies
├── @prisma/client: ^6.10.1    # Datenbank-Client
├── express: ^4.18.2           # Web-Framework
└── [weitere Backend-Dependencies]
```

---

## 🧪 **TESTS & VALIDATION**

### **Test-Dateien**
```
backend/tests/
├── [Routing-Tests]
├── [Map-Service-Tests]
└── [API-Tests]
```

### **Konfigurationsdateien**
```
backend/
├── jest.config.js             # Test-Konfiguration
├── tsconfig.json              # TypeScript-Konfiguration
└── [weitere Config-Dateien]
```

---

## 📊 **ANALYSE-BEREICHE**

### **1. KARTEN-FUNKTIONALITÄT**
**Dateien zu prüfen:**
- `src/components/map/InteractiveMap.tsx`
- `src/components/map/OfflineMapComponent.tsx`
- `src/lib/services/offline-map-service.ts`
- `backend/src/services/OfflineMapService.ts`

**Fragen:**
- Welche Karten-Styles sind verfügbar?
- Wie funktioniert das Offline-Caching?
- Welche Interaktionen sind möglich?

### **2. ROUTING-ENGINES**
**Dateien zu prüfen:**
- `src/lib/services/routing-service.ts`
- `backend/src/services/OfflineMapService.ts`
- `backend/config/valhalla.json`
- `backend/docker-compose-tiles.yml`

**Fragen:**
- Welche Routing-Profile sind konfiguriert?
- Wie funktioniert der Fallback zwischen OSRM und Valhalla?
- Welche Performance-Optimierungen sind implementiert?

### **3. OFFLINE-FUNKTIONALITÄT**
**Dateien zu prüfen:**
- `public/sw-maps.js`
- `src/lib/services/offline-map-service.ts`
- `backend/config/tileserver-config.json`

**Fragen:**
- Wie funktioniert das Service Worker Caching?
- Welche Daten werden offline gespeichert?
- Wie groß sind die Offline-Pakete?

### **4. DATENBANK & SCHEMA**
**Dateien zu prüfen:**
- `backend/prisma/schema.prisma`
- `backend/src/scripts/import-stations-from-excel.ts`
- `backend/docker-compose-tiles.yml`

**Fragen:**
- Welche Datenmodelle sind definiert?
- Wie werden Stationen importiert?
- Welche räumlichen Indizes sind vorhanden?

### **5. API & ENDPOINTS**
**Dateien zu prüfen:**
- `backend/src/routes/maps.ts`
- `backend/src/middleware/rateLimiter.ts`
- `proxy.js`

**Fragen:**
- Welche API-Endpoints sind verfügbar?
- Wie ist das Rate Limiting konfiguriert?
- Welche Authentifizierung ist implementiert?

---

## 🔍 **DETAILANALYSE-CHECKLISTE**

### **Phase 1: Grundlagen-Verständnis**
- [ ] `package.json` - Dependencies verstehen
- [ ] `docker-compose-tiles.yml` - Infrastruktur verstehen
- [ ] `schema.prisma` - Datenmodell verstehen

### **Phase 2: Frontend-Analyse**
- [ ] `InteractiveMap.tsx` - Online-Funktionalität
- [ ] `OfflineMapComponent.tsx` - Offline-Funktionalität
- [ ] `offline-map-service.ts` - Service-Layer

### **Phase 3: Backend-Analyse**
- [ ] `OfflineMapService.ts` - Backend-Services
- [ ] `maps.ts` - API-Endpoints
- [ ] Konfigurationsdateien - Routing & Tiles

### **Phase 4: Offline-Infrastruktur**
- [ ] `sw-maps.js` - Service Worker
- [ ] `tileserver-config.json` - Tile-Server
- [ ] `valhalla.json` - Routing-Konfiguration

### **Phase 5: Daten & Import**
- [ ] Import-Scripts - Daten-Import-Prozess
- [ ] Migrationen - Datenbank-Schema
- [ ] Test-Dateien - Funktionalität validieren

---

## 📋 **PRIORITÄTEN FÜR DIE ANALYSE**

### **🔴 HOHE PRIORITÄT (Sofort prüfen)**
1. `src/components/map/InteractiveMap.tsx` - Online-Karte
2. `src/components/map/OfflineMapComponent.tsx` - Offline-Karte
3. `backend/docker-compose-tiles.yml` - Infrastruktur
4. `backend/src/services/OfflineMapService.ts` - Backend-Services

### **🟡 MITTLERE PRIORITÄT (Innerhalb 1-2 Tage)**
1. `src/lib/services/offline-map-service.ts` - Frontend-Service
2. `backend/src/routes/maps.ts` - API-Endpoints
3. `backend/config/` - Konfigurationsdateien
4. `public/sw-maps.js` - Service Worker

### **🟢 NIEDRIGE PRIORITÄT (Später)**
1. Test-Dateien
2. Import-Scripts
3. Migrationen
4. Proxy-Konfiguration

---

## 💡 **ANALYSE-TIPPS**

### **Für jede Datei prüfen:**
1. **Zweck**: Was macht diese Datei?
2. **Abhängigkeiten**: Welche anderen Dateien werden verwendet?
3. **Konfiguration**: Welche Einstellungen sind wichtig?
4. **Performance**: Gibt es Optimierungsmöglichkeiten?
5. **Sicherheit**: Welche Sicherheitsaspekte sind zu beachten?

### **Dokumentation erstellen:**
- **Architektur-Diagramm** der Karten-Infrastruktur
- **API-Dokumentation** der Endpoints
- **Konfigurations-Guide** für verschiedene Umgebungen
- **Troubleshooting-Guide** für häufige Probleme

---

*Diese Liste hilft Ihnen, systematisch alle wichtigen Aspekte der Karten- und Routing-Infrastruktur zu analysieren.* 