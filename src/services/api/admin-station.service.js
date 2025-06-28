import { fetchStations, } from './backend-api.service';
import axios from 'axios';
// API-URL definieren
const API_URL = '/api/stationen';
// Hilfsfunktion zum Token holen
function getAuthToken() {
    try {
        // Token aus localStorage holen (Zustand-Store persistiert dort)
        const authData = localStorage.getItem('revierkompass-v2-auth');
        if (authData) {
            const parsed = JSON.parse(authData);
            if (parsed.token) {
                console.log('🔑 Token gefunden:', parsed.token.substring(0, 20) + '...');
                return parsed.token;
            }
        }
    }
    catch (error) {
        console.error('❌ Fehler beim Token abrufen:', error);
    }
    console.warn('⚠️ Kein Token im localStorage gefunden');
    return null;
}
export const adminStationService = {
    async createStation(station) {
        const token = getAuthToken();
        try {
            console.log('🔄 Erstelle neue Station...');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            // Koordinaten als Array senden
            const response = await axios.post(API_URL, {
                ...station,
                coordinates: station.coordinates
            }, { headers });
            console.log('✅ Station erfolgreich erstellt:', response.data);
            return response.data;
        }
        catch (error) {
            console.error('❌ Fehler beim Erstellen der Station:', error);
            throw error;
        }
    },
    async updateStation(id, updates) {
        const token = getAuthToken();
        try {
            console.log('🔄 Aktualisiere Station:', id);
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await axios.put(`${API_URL}/${id}`, updates, { headers });
            console.log('✅ Station erfolgreich aktualisiert:', response.data);
            return response.data;
        }
        catch (error) {
            console.error('❌ Fehler beim Aktualisieren der Station:', error);
            throw error;
        }
    },
    async deleteStation(id) {
        const token = getAuthToken();
        try {
            console.log('🔄 Lösche Station:', id);
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            await axios.delete(`${API_URL}/${id}`, { headers });
            console.log('✅ Station erfolgreich gelöscht');
        }
        catch (error) {
            console.error('❌ Fehler beim Löschen der Station:', error);
            throw error;
        }
        return true;
    },
    async toggleStationActive(id) {
        const stations = await fetchStations();
        const current = stations.find((s) => s.id === id);
        if (!current)
            throw new Error('Station not found');
        return this.updateStation(id, { isActive: !current.isActive });
    },
    async bulkUpdateStations(updates) {
        const promises = updates.map(({ id, changes }) => this.updateStation(id, changes));
        return Promise.all(promises);
    },
};
// Exportiere die Funktionen direkt
export const createStation = adminStationService.createStation;
export const updateStation = adminStationService.updateStation;
export const deleteStation = adminStationService.deleteStation;
export const toggleStationActive = adminStationService.toggleStationActive;
export const bulkUpdateStations = adminStationService.bulkUpdateStations;
