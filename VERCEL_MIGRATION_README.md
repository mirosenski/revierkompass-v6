# 🚀 Vercel Serverless Functions Migration

## Schnellstart

### 1. Setup ausführen
```bash
./deploy-vercel.sh
```

### 2. Umgebungsvariablen konfigurieren
```bash
cp env.example .env.local
# Bearbeite .env.local nach Bedarf
```

### 3. Dependencies installieren
```bash
npm install
npx prisma generate
```

### 4. Lokal testen
```bash
npm run vercel-dev
```

### 5. Deployen
```bash
npm run vercel-deploy
```

## 📁 Projektstruktur

```
├── api/                          # Vercel Serverless Functions
│   ├── health.ts                 # Health Check API
│   ├── stationen/                # Stationen API
│   │   ├── index.ts             # GET /api/stationen, POST /api/stationen
│   │   └── [id].ts              # GET/PUT/DELETE /api/stationen/:id
│   └── lib/                      # Shared Utilities
│       ├── prisma.ts            # Database Connection
│       └── error-handler.ts     # Error Handling
├── prisma/                       # Database Schema
│   └── schema.prisma
├── src/lib/api.ts               # Frontend API Client
├── vercel.json                  # Vercel Configuration
└── package.json                 # Dependencies & Scripts
```

## 🔧 API Endpoints

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/api/health` | Health Check |
| GET | `/api/stationen` | Alle Stationen abrufen |
| POST | `/api/stationen` | Neue Station erstellen |
| GET | `/api/stationen/:id` | Einzelne Station abrufen |
| PUT | `/api/stationen/:id` | Station aktualisieren |
| DELETE | `/api/stationen/:id` | Station löschen |

## 🧪 Testing

### Lokale Tests
```bash
# Health Check
curl http://localhost:3000/api/health

# Stationen abrufen
curl http://localhost:3000/api/stationen

# Station erstellen
curl -X POST http://localhost:3000/api/stationen \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Station","type":"Polizei","city":"Berlin","coordinates":[52.5200,13.4050]}'
```

### Frontend Integration
```typescript
import { api } from './src/lib/api';

// Stationen abrufen
const stations = await api.stations.getAll();

// Station erstellen
const newStation = await api.stations.create({
  name: "Test Station",
  type: "Polizei",
  city: "Berlin",
  coordinates: [52.5200, 13.4050]
});
```

## 🔄 Migration von Express.js

### Vorher (Express.js)
```javascript
// backend/simple-server.js
app.get('/api/stationen', async (req, res) => {
  const stations = await prisma.policeStation.findMany();
  res.json(stations);
});
```

### Nachher (Vercel Serverless)
```typescript
// api/stationen/index.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const stations = await prisma.policeStation.findMany();
    res.json(stations);
  }
}
```

## 🌍 Environment Variables

### Lokale Entwicklung (.env.local)
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

### Vercel Dashboard
- `DATABASE_URL`: SQLite/PostgreSQL Verbindung
- `NODE_ENV`: `production`

## 📊 Monitoring

### Vercel Logs
```bash
vercel logs
```

### Function Analytics
- Vercel Dashboard → Functions
- Performance & Error Monitoring

## 🚨 Troubleshooting

### Häufige Probleme

1. **Prisma Client nicht gefunden**
   ```bash
   npx prisma generate
   ```

2. **CORS Fehler**
   - CORS Headers sind bereits in allen API-Routen konfiguriert

3. **Datenbankverbindung**
   - Stelle sicher, dass `DATABASE_URL` korrekt gesetzt ist
   - Für SQLite: `file:./dev.db`

4. **Kalte Starts**
   - Normal bei Serverless Functions
   - Erste Anfrage kann langsamer sein

## 🔄 Rollback

Falls Probleme auftreten:

```bash
# Sofortiger Rollback
vercel rollback

# Zurück zu Express.js
# Die ursprünglichen Dateien in /backend bleiben erhalten
```

## 📈 Nächste Schritte

1. **Authentifizierung**: JWT-basierte Auth implementieren
2. **Rate Limiting**: Vercel Edge Functions
3. **Caching**: Redis für Session-Management
4. **Monitoring**: Sentry Integration
5. **CI/CD**: GitHub Actions für automatisches Deployment

---

**✅ Migration erfolgreich!** Ihre Express.js API läuft jetzt als Vercel Serverless Functions. 