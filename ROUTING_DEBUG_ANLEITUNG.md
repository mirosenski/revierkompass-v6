# Routing & CORS Debugging – Schritt-für-Schritt-Anleitung

## 1. Lokalen Proxy-Server einrichten

Erstelle im Projekt-Root eine Datei `proxy.js`:

```js
const express = require('express');
const request = require('request');
const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/route/:startLon/:startLat/:endLon/:endLat', (req, res) => {
  const { startLon, startLat, endLon, endLat } = req.params;
  const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
  req.pipe(request(url)).pipe(res);
});

app.listen(port, () => {
  console.log(`Proxy läuft auf http://localhost:${port}`);
});
```

**Installation:**
```bash
npm install express request
```

**Starten:**
```bash
node proxy.js
```

---

## 2. routing-service.ts auf lokalen Proxy umstellen

Passe die URL-Generierung an:

```typescript
const buildOSRMUrl = (start: Coordinates, end: Coordinates) => {
  return `http://localhost:3000/route/${start.lng}/${start.lat}/${end.lng}/${end.lat}`;
};
```

Alle OSRM-Requests müssen über diesen Proxy laufen!

---

## 3. Debug-Linie in InteractiveMap.tsx einbauen

Füge in `setupMapSources` eine Test-Linie ein:

```typescript
const testCoordinates = [
  [startCoordinates.lng, startCoordinates.lat],
  [9.2195, 48.7309]
];

map.current!.addSource('test-route', {
  type: 'geojson',
  data: {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: testCoordinates
    }
  }
});

map.current!.addLayer({
  id: 'test-line',
  type: 'line',
  source: 'test-route',
  paint: {
    'line-color': '#ff0000',
    'line-width': 5
  }
});
```

**→ Wenn diese Linie erscheint, ist das Map-Rendering korrekt!**

---

## 4. Koordinaten-Format und Debug-Logs prüfen

In `setupMapSources`:

```typescript
console.log('🗺️ Route-Koordinaten:', route.route?.coordinates);
```

**→ In der Konsole sollten echte Koordinaten-Arrays erscheinen!**

---

## 5. (Optional) LRU-Cache für Produktivbetrieb

```typescript
import { LRUCache } from 'lru-cache';

const routeCache = new LRUCache<string, RouteResult>({
  max: 500,
  ttl: 1000 * 60 * 5 // 5 Minuten
});
```

---

## Zusammenfassung

- **Proxy-Server** löst CORS und macht OSRM nutzbar
- **Korrektes Koordinaten-Format** garantiert sichtbare Linien
- **Test-Linie** prüft Map-Rendering
- **Debug-Logs** zeigen, ob Routing-Daten ankommen

---

**Tipp:**
- Prüfe die Browser-Konsole auf Logs wie `🗺️ Route-Koordinaten: ...` und Fehler.
- Entferne die Test-Linie nach erfolgreichem Test wieder. 