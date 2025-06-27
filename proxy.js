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
