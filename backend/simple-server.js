const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy für IP-Erkennung
app.set('trust proxy', 1);

// CORS konfigurieren - dynamisch alle localhost Ports erlauben (für Entwicklung)
const corsOptions = {
  origin: 'http://localhost:5175',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
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
app.get('/api/stationen', (req, res) => {
  try {
    const stationsData = require('./data/polizeistationen.json');
    res.json(stationsData);
  } catch (error) {
    console.error('Fehler beim Laden der Stationen:', error);
    res.status(500).json({ error: 'Stationen konnten nicht geladen werden' });
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
  console.log(`🚀 RevierKompass Simple Backend läuft auf Port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏢 Stationen API: http://localhost:${PORT}/api/stationen`);
  console.log(`📁 Static files: http://localhost:${PORT}/data/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 