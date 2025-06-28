import prisma from '../lib/prisma';
import { handleError } from '../lib/error-handler';
export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Ungültige Station ID' });
    }
    try {
        switch (req.method) {
            case 'GET':
                return await getStation(req, res, id);
            case 'PUT':
                return await updateStation(req, res, id);
            case 'DELETE':
                return await deleteStation(req, res, id);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    }
    catch (error) {
        return handleError(error, res);
    }
}
async function getStation(req, res, id) {
    const station = await prisma.policeStation.findUnique({
        where: { id }
    });
    if (!station) {
        return res.status(404).json({ error: 'Station nicht gefunden' });
    }
    const processedStation = {
        ...station,
        coordinates: station.coordinates ? JSON.parse(station.coordinates) : null
    };
    res.json(processedStation);
}
async function updateStation(req, res, id) {
    const { id: bodyId, ...updateData } = req.body;
    // Validierung
    if (updateData.name === '') {
        return res.status(400).json({ error: 'Name darf nicht leer sein' });
    }
    const updated = await prisma.policeStation.update({
        where: { id },
        data: {
            ...updateData,
            coordinates: updateData.coordinates ? JSON.stringify(updateData.coordinates) : null
        }
    });
    const processedStation = {
        ...updated,
        coordinates: updated.coordinates ? JSON.parse(updated.coordinates) : null
    };
    res.json(processedStation);
}
async function deleteStation(req, res, id) {
    await prisma.policeStation.delete({ where: { id } });
    res.status(204).send('');
}
