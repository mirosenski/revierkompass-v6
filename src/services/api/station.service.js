import { fetchStations } from './backend-api.service';
export const stationService = {
    getAllStations: async () => {
        return fetchStations();
    },
    getStationById: async (id) => {
        const stations = await fetchStations();
        const station = stations.find((s) => s.id === id);
        return station ?? null;
    },
    getStationsByType: async (type) => {
        const stations = await fetchStations();
        return stations.filter((s) => s.type === type);
    },
    getReviereByPraesidium: async (praesidiumId) => {
        const stations = await fetchStations();
        return stations.filter((s) => s.parentId === praesidiumId);
    },
};
