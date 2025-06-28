// API Client für Vercel Serverless Functions
const API_BASE = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api'
    : '/api';
class ApiError extends Error {
    status;
    data;
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || `HTTP ${response.status}`, response.status, errorData);
    }
    return response.json();
}
export const api = {
    // Health Check
    health: async () => {
        const response = await fetch(`${API_BASE}/health`);
        return handleResponse(response);
    },
    // Stationen API
    stations: {
        // Alle Stationen abrufen
        getAll: async () => {
            const response = await fetch(`${API_BASE}/stationen`);
            return handleResponse(response);
        },
        // Einzelne Station abrufen
        getById: async (id) => {
            const response = await fetch(`${API_BASE}/stationen/${id}`);
            return handleResponse(response);
        },
        // Neue Station erstellen
        create: async (data) => {
            const response = await fetch(`${API_BASE}/stationen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        },
        // Station aktualisieren
        update: async (id, data) => {
            const response = await fetch(`${API_BASE}/stationen/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        },
        // Station löschen
        delete: async (id) => {
            const response = await fetch(`${API_BASE}/stationen/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(errorData.error || `HTTP ${response.status}`, response.status, errorData);
            }
        },
    },
};
// React Query Hooks (falls @tanstack/react-query verwendet wird)
export const useStations = () => {
    // Implementierung für React Query
    return {
        queryKey: ['stations'],
        queryFn: api.stations.getAll,
    };
};
export const useStation = (id) => {
    return {
        queryKey: ['station', id],
        queryFn: () => api.stations.getById(id),
        enabled: !!id,
    };
};
export { ApiError };
