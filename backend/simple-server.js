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
    // ID aus dem Request-Body entfernen, damit Prisma automatisch generiert
    const { id, ...stationData } = req.body;
    
    const newStation = await prisma.policeStation.create({
      data: {
        ...stationData,
        coordinates: stationData.coordinates ? JSON.stringify(stationData.coordinates) : null
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

// Alle Stationen löschen (für Datenbank-Bereinigung)
app.delete('/api/stationen', async (req, res) => {
  try {
    const deletedCount = await prisma.policeStation.deleteMany({});
    console.log(`🧹 ${deletedCount.count} Stationen gelöscht`);
    res.json({ 
      message: `${deletedCount.count} Stationen erfolgreich gelöscht`,
      deletedCount: deletedCount.count 
    });
  } catch (error) {
    console.error('Fehler beim Löschen aller Stationen:', error);
    res.status(500).json({ error: 'Stationen konnten nicht gelöscht werden' });
  }
});

// ===== ADDRESS ROUTES =====

// POST /api/addresses/anonymous - Create anonymous address for review
app.post('/api/addresses/anonymous', async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      userId: null,
      isAnonymous: true,
      reviewStatus: 'pending',
      addressType: req.body.addressType || 'permanent',
      parentId: req.body.parentId || null,
      coordinates: req.body.coordinates ? JSON.stringify(req.body.coordinates) : null
    };

    const address = await prisma.customAddress.create({
      data: addressData,
    });

    res.status(201).json({
      message: 'Adresse zur Überprüfung eingereicht',
      address: {
        id: address.id,
        name: address.name,
        reviewStatus: address.reviewStatus,
        addressType: address.addressType,
      },
    });
  } catch (error) {
    console.error('Create anonymous address error:', error);
    res.status(500).json({ error: 'Fehler beim Einreichen der Adresse' });
  }
});

// PUT /api/addresses/anonymous/:id - Update anonymous address
app.put('/api/addresses/anonymous/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const address = await prisma.customAddress.update({
      where: { id },
      data: {
        ...req.body,
        coordinates: req.body.coordinates ? JSON.stringify(req.body.coordinates) : null
      },
    });

    res.json({
      message: 'Adresse erfolgreich aktualisiert',
      address,
    });
  } catch (error) {
    console.error('Update anonymous address error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Adresse' });
  }
});

// DELETE /api/addresses/anonymous/:id - Delete anonymous address
app.delete('/api/addresses/anonymous/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete
    const address = await prisma.customAddress.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      message: 'Adresse erfolgreich gelöscht',
      address,
    });
  } catch (error) {
    console.error('Delete anonymous address error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Adresse' });
  }
});

// GET /api/addresses - Get all addresses (for admin)
app.get('/api/addresses', async (req, res) => {
  try {
    const addresses = await prisma.customAddress.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Adressen' });
  }
});

// Alle Adressen löschen (für Datenbank-Bereinigung)
app.delete('/api/addresses', async (req, res) => {
  try {
    const deletedCount = await prisma.customAddress.deleteMany({});
    console.log(`🧹 ${deletedCount.count} Adressen gelöscht`);
    res.json({ 
      message: `${deletedCount.count} Adressen erfolgreich gelöscht`,
      deletedCount: deletedCount.count 
    });
  } catch (error) {
    console.error('Fehler beim Löschen aller Adressen:', error);
    res.status(500).json({ error: 'Adressen konnten nicht gelöscht werden' });
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