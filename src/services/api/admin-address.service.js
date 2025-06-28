import axios from 'axios';
// Verwende Vite Proxy statt direkter Backend-URL
const API_URL = '/api/stationen';
export const adminAddressService = {
    // Alle Adressen abrufen (als Stationen mit speziellem Typ)
    async getAllAddresses() {
        try {
            const response = await axios.get(API_URL);
            // Filtere nur Adressen (Stationen mit speziellem Typ oder ohne parentId)
            const addresses = response.data.filter((station) => station.type === 'address' || !station.parentId || station.type === 'custom');
            return addresses.map((station) => ({
                id: station.id,
                name: station.name,
                street: station.address,
                zipCode: station.zipCode || '',
                city: station.city,
                coordinates: station.coordinates,
                isVerified: station.isVerified || false,
                isActive: station.isActive,
                reviewStatus: station.reviewStatus || 'pending',
                createdAt: station.lastModified,
                user: station.user,
                parentId: station.parentId
            }));
        }
        catch (error) {
            console.error('Fehler beim Laden der Adressen:', error);
            throw error;
        }
    },
    // Neue Adresse erstellen (als Station)
    async createAddress(addressData) {
        try {
            const stationData = {
                name: addressData.name,
                type: 'address',
                city: addressData.city,
                address: addressData.street,
                coordinates: addressData.coordinates,
                telefon: '',
                email: '',
                notdienst24h: false,
                isActive: addressData.isActive !== false,
                isVerified: addressData.isVerified || false,
                reviewStatus: addressData.reviewStatus || 'pending',
                zipCode: addressData.zipCode,
                parentId: addressData.parentId || undefined
            };
            const response = await axios.post(API_URL, stationData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return {
                id: response.data.id,
                name: response.data.name,
                street: response.data.address,
                zipCode: response.data.zipCode || '',
                city: response.data.city,
                coordinates: response.data.coordinates,
                isVerified: response.data.isVerified || false,
                isActive: response.data.isActive,
                reviewStatus: response.data.reviewStatus || 'pending',
                createdAt: response.data.lastModified,
                user: response.data.user,
                parentId: response.data.parentId
            };
        }
        catch (error) {
            console.error('Fehler beim Erstellen der Adresse:', error);
            throw error;
        }
    },
    // Adresse aktualisieren
    async updateAddress(id, addressData) {
        try {
            const stationData = {};
            if (addressData.name)
                stationData.name = addressData.name;
            if (addressData.street)
                stationData.address = addressData.street;
            if (addressData.city)
                stationData.city = addressData.city;
            if (addressData.coordinates)
                stationData.coordinates = addressData.coordinates;
            if (addressData.zipCode)
                stationData.zipCode = addressData.zipCode;
            if (addressData.isVerified !== undefined)
                stationData.isVerified = addressData.isVerified;
            if (addressData.isActive !== undefined)
                stationData.isActive = addressData.isActive;
            if (addressData.reviewStatus)
                stationData.reviewStatus = addressData.reviewStatus;
            if (addressData.parentId !== undefined)
                stationData.parentId = addressData.parentId;
            const response = await axios.put(`${API_URL}/${id}`, stationData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return {
                id: response.data.id,
                name: response.data.name,
                street: response.data.address,
                zipCode: response.data.zipCode || '',
                city: response.data.city,
                coordinates: response.data.coordinates,
                isVerified: response.data.isVerified || false,
                isActive: response.data.isActive,
                reviewStatus: response.data.reviewStatus || 'pending',
                createdAt: response.data.lastModified,
                user: response.data.user,
                parentId: response.data.parentId
            };
        }
        catch (error) {
            console.error('Fehler beim Aktualisieren der Adresse:', error);
            throw error;
        }
    },
    // Adresse löschen
    async deleteAddress(id) {
        try {
            await axios.delete(`${API_URL}/${id}`);
        }
        catch (error) {
            console.error('Fehler beim Löschen der Adresse:', error);
            throw error;
        }
    },
    // Adresse genehmigen
    async approveAddress(id) {
        try {
            const response = await axios.put(`${API_URL}/${id}`, {
                reviewStatus: 'approved',
                isVerified: true
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return {
                id: response.data.id,
                name: response.data.name,
                street: response.data.address,
                zipCode: response.data.zipCode || '',
                city: response.data.city,
                coordinates: response.data.coordinates,
                isVerified: response.data.isVerified || false,
                isActive: response.data.isActive,
                reviewStatus: response.data.reviewStatus || 'pending',
                createdAt: response.data.lastModified,
                user: response.data.user,
                parentId: response.data.parentId
            };
        }
        catch (error) {
            console.error('Fehler beim Genehmigen der Adresse:', error);
            throw error;
        }
    },
    // Adresse ablehnen
    async rejectAddress(id, reason) {
        try {
            const response = await axios.put(`${API_URL}/${id}`, {
                reviewStatus: 'rejected',
                isActive: false
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return {
                id: response.data.id,
                name: response.data.name,
                street: response.data.address,
                zipCode: response.data.zipCode || '',
                city: response.data.city,
                coordinates: response.data.coordinates,
                isVerified: response.data.isVerified || false,
                isActive: response.data.isActive,
                reviewStatus: response.data.reviewStatus || 'pending',
                createdAt: response.data.lastModified,
                user: response.data.user,
                parentId: response.data.parentId
            };
        }
        catch (error) {
            console.error('Fehler beim Ablehnen der Adresse:', error);
            throw error;
        }
    },
    // Ausstehende Adressen abrufen
    async getPendingAddresses() {
        try {
            const response = await axios.get(API_URL);
            const pendingAddresses = response.data.filter((station) => (station.type === 'address' || !station.parentId) &&
                station.reviewStatus === 'pending');
            return pendingAddresses.map((station) => ({
                id: station.id,
                name: station.name,
                street: station.address,
                zipCode: station.zipCode || '',
                city: station.city,
                coordinates: station.coordinates,
                isVerified: station.isVerified || false,
                isActive: station.isActive,
                reviewStatus: station.reviewStatus || 'pending',
                createdAt: station.lastModified,
                user: station.user
            }));
        }
        catch (error) {
            console.error('Fehler beim Laden ausstehender Adressen:', error);
            throw error;
        }
    },
    // Adress-Statistiken abrufen
    async getAddressStats() {
        try {
            const response = await axios.get(API_URL);
            const addresses = response.data.filter((station) => station.type === 'address' || !station.parentId);
            const total = addresses.length;
            const pending = addresses.filter((a) => a.reviewStatus === 'pending').length;
            const approved = addresses.filter((a) => a.reviewStatus === 'approved').length;
            const rejected = addresses.filter((a) => a.reviewStatus === 'rejected').length;
            return {
                total,
                pending,
                approved,
                rejected,
                verified: addresses.filter((a) => a.isVerified).length
            };
        }
        catch (error) {
            console.error('Fehler beim Laden der Adress-Statistiken:', error);
            throw error;
        }
    }
};
export default adminAddressService;
