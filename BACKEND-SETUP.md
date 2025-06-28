# Revierkompass Backend Setup

## 🚀 Schnellstart

### Option 1: PM2 (Empfohlen)

```bash
# Backend starten
./start-backend.sh

# Oder manuell:
cd backend
npm install
pm2 start ecosystem.config.js
```

### Option 2: Docker Compose

```bash
# Backend mit Docker starten
docker-compose -f docker-compose.backend.yml up -d
```

### Option 3: Direkt starten

```bash
cd backend
npm install
node server.js
```

## 📊 Monitoring

### PM2 Befehle

```bash
# Status anzeigen
pm2 status

# Logs anzeigen
pm2 logs revierkompass-backend

# Neustart
pm2 restart revierkompass-backend

# Stoppen
pm2 stop revierkompass-backend

# Löschen
pm2 delete revierkompass-backend
```

### Autostart konfigurieren

```bash
# PM2 Autostart einrichten
pm2 startup
pm2 save

# System-Neustart testen
sudo reboot
```

## 🔧 Konfiguration

### Environment Variables

- `NODE_ENV`: `development` oder `production`
- `PORT`: Backend-Port (Standard: 3001)

### API Endpunkte

- `GET /api/stationen` - Alle Stationen abrufen
- `POST /api/stationen` - Neue Station erstellen
- `PUT /api/stationen/:id` - Station aktualisieren
- `DELETE /api/stationen/:id` - Station löschen

## 🛠️ Troubleshooting

### Backend nicht erreichbar

1. **Port prüfen:**
   ```bash
   netstat -tlnp | grep 3001
   ```

2. **PM2 Status prüfen:**
   ```bash
   pm2 status
   ```

3. **Logs prüfen:**
   ```bash
   pm2 logs revierkompass-backend
   ```

4. **Manuell starten:**
   ```bash
   cd backend
   node server.js
   ```

### Dependencies Problem

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Port bereits belegt

```bash
# Prozess finden
lsof -i :3001

# Prozess beenden
kill -9 <PID>
```

## 📁 Dateistruktur

```
backend/
├── server.js              # Hauptserver
├── ecosystem.config.js    # PM2-Konfiguration
├── package.json          # Dependencies
├── data/
│   └── polizeistationen.json  # Stationsdaten
└── logs/                 # PM2-Logs
```

## 🔄 Fallback-Mechanismus

Das Frontend hat einen integrierten Fallback-Mechanismus:

- Bei Backend-Ausfall werden lokale Daten verwendet
- Lokale Daten: `src/data/polizeistationen.json`
- Automatische Erkennung und Umschaltung

## 🚨 Wichtige Hinweise

1. **PM2 muss global installiert sein:**
   ```bash
   npm install -g pm2
   ```

2. **Backend-Dependencies installieren:**
   ```bash
   cd backend && npm install
   ```

3. **Port 3001 muss frei sein**

4. **Firewall-Einstellungen prüfen**

## 📞 Support

Bei Problemen:

1. Logs prüfen: `pm2 logs revierkompass-backend`
2. Status prüfen: `pm2 status`
3. Backend manuell starten: `cd backend && node server.js` 