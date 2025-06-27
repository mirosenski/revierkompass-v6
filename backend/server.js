const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Datenpfad
const DATA_FILE = path.join(__dirname, 'data/polizeistationen.json');

// Route-Stub für Test
app.get('/', (req, res) => {
  res.send('Backend läuft!');
});

// GET /api/stationen
app.get('/api/stationen', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Daten konnten nicht gelesen werden' });
  }
});

// POST /api/stationen
app.post('/api/stationen', (req, res) => {
  try {
    const newStation = req.body;
    const stations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // ID generieren, falls nicht vorhanden
    if (!newStation.id) {
      const timestamp = Date.now();
      newStation.id = `station-${timestamp}`;
    }

    // lastModified hinzufügen, falls nicht vorhanden
    if (!newStation.lastModified) {
      newStation.lastModified = new Date().toISOString();
    }

    stations.push(newStation);
    fs.writeFileSync(DATA_FILE, JSON.stringify(stations, null, 2));

    res.status(201).json(newStation);
  } catch (error) {
    res.status(500).json({ error: 'Station konnte nicht erstellt werden' });
  }
});

// PUT /api/stationen/:id
app.put('/api/stationen/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedStation = req.body;
    const stations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    const index = stations.findIndex(station => station.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Station nicht gefunden' });
    }

    stations[index] = { ...stations[index], ...updatedStation };
    fs.writeFileSync(DATA_FILE, JSON.stringify(stations, null, 2));

    res.json(stations[index]);
  } catch (error) {
    res.status(500).json({ error: 'Station konnte nicht aktualisiert werden' });
  }
});

// DELETE /api/stationen/:id
app.delete('/api/stationen/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    const filtered = stations.filter(station => station.id !== id);
    if (filtered.length === stations.length) {
      return res.status(404).json({ error: 'Station nicht gefunden' });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Station konnte nicht gelöscht werden' });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 JSON-Server läuft auf http://localhost:${PORT}`);
  console.log(`📊 API-Endpunkte:`);
  console.log(`   GET  /api/stationen     - Alle Stationen abrufen`);
  console.log(`   POST /api/stationen     - Neue Station erstellen`);
  console.log(`   PUT  /api/stationen/:id - Station aktualisieren`);
  console.log(`   DELETE /api/stationen/:id - Station löschen`);
  console.log(`📁 Datenquelle: ${DATA_FILE}`);
});
