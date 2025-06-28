# Migration von Express.js zu Vercel Serverless Functions

## Übersicht
Diese Anleitung beschreibt die schrittweise Migration des bestehenden Express.js Backends zu Vercel Serverless Functions.

## 1. Projektstruktur vorbereiten

### 1.1 API-Verzeichnis erstellen
```bash
mkdir -p api
```

### 1.2 Vercel-Konfiguration aktualisieren
Die bestehende `vercel.json` muss erweitert werden:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 2. Route-Migration

### 2.1 Health Check Route
**Datei:** `api/health.ts`

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
```

### 2.2 Stationen API Routes
**Datei:** `api/stationen/index.ts`

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getStations(req, res);
      case 'POST':
        return await createStation(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Interner Serverfehler' });
  }
}

async function getStations(req: VercelRequest, res: VercelResponse) {
  const stations = await prisma.policeStation.findMany();
  
  const processedStations = stations.map(station => ({
    ...station,
    coordinates: station.coordinates ? JSON.parse(station.coordinates) : null
  }));
  
  res.json(processedStations);
}

async function createStation(req: VercelRequest, res: VercelResponse) {
  const { id, ...stationData } = req.body;
  
  const newStation = await prisma.policeStation.create({
    data: {
      ...stationData,
      coordinates: stationData.coordinates ? JSON.stringify(stationData.coordinates) : null
    }
  });
  
  const processedStation = {
    ...newStation,
    coordinates: newStation.coordinates ? JSON.parse(newStation.coordinates) : null
  };
  
  res.status(201).json(processedStation);
}
```

**Datei:** `api/stationen/[id].ts`

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    switch (req.method) {
      case 'PUT':
        return await updateStation(req, res, id as string);
      case 'DELETE':
        return await deleteStation(req, res, id as string);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Interner Serverfehler' });
  }
}

async function updateStation(req: VercelRequest, res: VercelResponse, id: string) {
  const updated = await prisma.policeStation.update({
    where: { id },
    data: {
      ...req.body,
      coordinates: req.body.coordinates ? JSON.stringify(req.body.coordinates) : null
    }
  });
  
  const processedStation = {
    ...updated,
    coordinates: updated.coordinates ? JSON.parse(updated.coordinates) : null
  };
  
  res.json(processedStation);
}

async function deleteStation(req: VercelRequest, res: VercelResponse, id: string) {
  await prisma.policeStation.delete({ where: { id } });
  res.status(204).send();
}
```

## 3. Middleware und Utilities

### 3.1 CORS Middleware
**Datei:** `api/_middleware.ts`

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function middleware(req: VercelRequest, res: VercelResponse) {
  // CORS Headers für alle API-Routen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  // Preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
}
```

### 3.2 Database Connection Utility
**Datei:** `api/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;
```

## 4. Package.json Anpassungen

### 4.1 Dependencies hinzufügen
```json
{
  "dependencies": {
    "@vercel/node": "^3.0.0",
    "@prisma/client": "^6.10.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.4",
    "prisma": "^6.10.1",
    "typescript": "^5.3.3"
  }
}
```

### 4.2 Scripts hinzufügen
```json
{
  "scripts": {
    "vercel-build": "prisma generate",
    "dev": "vercel dev",
    "deploy": "vercel --prod"
  }
}
```

## 5. Environment Variables

### 5.1 Vercel Dashboard
Folgende Umgebungsvariablen müssen im Vercel Dashboard gesetzt werden:

- `DATABASE_URL`: Ihre SQLite/PostgreSQL Verbindung
- `NODE_ENV`: `production`
- `JWT_SECRET`: Für Authentifizierung (falls verwendet)

### 5.2 Lokale Entwicklung
Erstellen Sie eine `.env.local` Datei:

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

## 6. Deployment-Schritte

### 6.1 Vercel CLI installieren
```bash
npm install -g vercel
```

### 6.2 Projekt verlinken
```bash
vercel link
```

### 6.3 Lokal testen
```bash
vercel dev
```

### 6.4 Deployen
```bash
vercel --prod
```

## 7. Frontend-Anpassungen

### 7.1 API-Base URL anpassen
In Ihrer Frontend-Konfiguration:

```typescript
// Für lokale Entwicklung
const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api' 
  : '/api';

// API-Aufrufe anpassen
const response = await fetch(`${API_BASE}/stationen`);
```

## 8. Testing

### 8.1 Lokale Tests
```bash
# Health Check
curl http://localhost:3000/api/health

# Stationen abrufen
curl http://localhost:3000/api/stationen

# Station erstellen
curl -X POST http://localhost:3000/api/stationen \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Station","coordinates":[52.5200,13.4050]}'
```

### 8.2 Production Tests
Nach dem Deployment können Sie die gleichen Tests gegen Ihre Vercel-URL ausführen.

## 9. Monitoring und Debugging

### 9.1 Vercel Logs
```bash
vercel logs
```

### 9.2 Function Analytics
Im Vercel Dashboard unter "Functions" können Sie Performance und Fehler einsehen.

## 10. Optimierungen

### 10.1 Connection Pooling
Für bessere Performance in Serverless-Umgebungen:

```typescript
// api/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 10.2 Error Handling
Implementieren Sie einheitliches Error Handling:

```typescript
// api/lib/error-handler.ts
export function handleError(error: any, res: VercelResponse) {
  console.error('API Error:', error);
  
  if (error.code === 'P2002') {
    return res.status(409).json({ error: 'Eintrag bereits vorhanden' });
  }
  
  return res.status(500).json({ error: 'Interner Serverfehler' });
}
```

## 11. Rollback-Strategie

Falls Probleme auftreten:

1. **Sofortiger Rollback**: `vercel rollback`
2. **Zurück zu Express**: Die ursprünglichen Dateien bleiben erhalten
3. **Graduelle Migration**: Schrittweise Route für Route migrieren

## 12. Nächste Schritte

1. **Authentifizierung**: JWT-basierte Auth implementieren
2. **Rate Limiting**: Vercel Edge Functions für Rate Limiting
3. **Caching**: Redis für Session-Management
4. **Monitoring**: Sentry oder ähnliche Tools integrieren

---

**Wichtige Hinweise:**
- Serverless Functions haben eine maximale Ausführungszeit (10-60 Sekunden)
- Kalte Starts können die erste Anfrage verlangsamen
- Datenbankverbindungen sollten bei jeder Anfrage neu aufgebaut werden
- Statische Dateien sollten über Vercel's CDN bereitgestellt werden 