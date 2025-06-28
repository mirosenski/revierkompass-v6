const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy für IP-Erkennung
app.set('trust proxy', 1);

// CORS konfigurieren - dynamisch alle localhost Ports erlauben (für Entwicklung)
const corsOptions = {
  origin: function (origin, callback) {
    // Erlaube alle localhost Ports für Entwicklung
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS nicht erlaubt'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files mit korrektem Content-Type für JSON
app.use('/data', express.static(path.join(__dirname, 'data'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.get('/api/stationen', async (req, res) => {
  try {
    const stations = await prisma.policeStation.findMany();
    
    // Koordinaten von JSON-String zu Array konvertieren
    const processedStations = stations.map(station => ({
      ...station,
      coordinates: station.coordinates ? JSON.parse(station.coordinates) : null
    }));
    
    res.json(processedStations);
  } catch (error) {
    console.error('Datenbankfehler:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Stationen' });
  }
});

// Neue Station erstellen
app.post('/api/stationen', async (req, res) => {
  try {
    const newStation = await prisma.policeStation.create({
      data: {
        ...req.body,
        coordinates: req.body.coordinates ? JSON.stringify(req.body.coordinates) : null
      }
    });
    
    // Koordinaten von JSON-String zu Array konvertieren
    const processedStation = {
      ...newStation,
      coordinates: newStation.coordinates ? JSON.parse(newStation.coordinates) : null
    };
    
    res.status(201).json(processedStation);
  } catch (error) {
    console.error('Erstellungsfehler:', error);
    res.status(500).json({ error: 'Station konnte nicht erstellt werden' });
  }
});

// Station aktualisieren
app.put('/api/stationen/:id', async (req, res) => {
  try {
    const updated = await prisma.policeStation.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        coordinates: req.body.coordinates ? JSON.stringify(req.body.coordinates) : null
      }
    });
    
    // Koordinaten von JSON-String zu Array konvertieren
    const processedStation = {
      ...updated,
      coordinates: updated.coordinates ? JSON.parse(updated.coordinates) : null
    };
    
    res.json(processedStation);
  } catch (error) {
    console.error('Updatefehler:', error);
    res.status(500).json({ error: 'Station konnte nicht aktualisiert werden' });
  }
});

// Station löschen
app.delete('/api/stationen/:id', async (req, res) => {
  try {
    await prisma.policeStation.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Löschfehler:', error);
    res.status(500).json({ error: 'Station konnte nicht gelöscht werden' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint nicht gefunden',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ 
    error: 'Interner Serverfehler',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 SQLite-Backend läuft auf Port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏢 Stationen API: http://localhost:${PORT}/api/stationen`);
  console.log(`📁 Static files: http://localhost:${PORT}/data/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 