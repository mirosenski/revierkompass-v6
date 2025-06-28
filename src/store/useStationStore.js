import { create } from 'zustand';
import { stationService } from '@/services/api/station.service';
export const useStationStore = create((set, get) => ({
    stations: [],
    isLoading: false,
    error: null,
    loadStations: async () => {
        console.log('🔄 useStationStore: Lade Stationen...');
        set({ isLoading: true, error: null });
        try {
            const data = await stationService.getAllStations();
            console.log('✅ useStationStore: Stationen geladen:', data.length);
            set({ stations: data, isLoading: false });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('❌ useStationStore: Fehler beim Laden:', message);
            set({ error: message, isLoading: false });
        }
    },
    getStationsByType: (type) => {
        const stations = get().stations;
        if (!Array.isArray(stations))
            return [];
        return stations.filter((s) => s.type === type);
    },
    getReviereByPraesidium: (praesidiumId) => {
        const stations = get().stations;
        if (!Array.isArray(stations))
            return [];
        return stations.filter((s) => s.parentId === praesidiumId);
    },
    getPraesidiumById: (id) => {
        const stations = get().stations;
        if (!Array.isArray(stations))
            return undefined;
        return stations.find((s) => s.id === id && s.type === 'praesidium');
    }
}));
