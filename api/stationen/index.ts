import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../lib/prisma';
import { handleError } from '../lib/error-handler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
    return handleError(error, res);
  }
}

async function getStations(req: VercelRequest, res: VercelResponse) {
  const stations = await prisma.policeStation.findMany({
    orderBy: { name: 'asc' }
  });
  
  const processedStations = stations.map(station => ({
    ...station,
    coordinates: station.coordinates ? JSON.parse(station.coordinates) : null
  }));
  
  res.json(processedStations);
}

async function createStation(req: VercelRequest, res: VercelResponse) {
  const { id, ...stationData } = req.body;
  
  // Validierung
  if (!stationData.name) {
    return res.status(400).json({ error: 'Name ist erforderlich' });
  }
  
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