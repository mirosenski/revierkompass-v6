import { Station } from '@/types/station.types';
interface StationStore {
    stations: Station[];
    isLoading: boolean;
    error: string | null;
    loadStations: () => Promise<void>;
    getStationsByType: (type: 'praesidium' | 'revier') => Station[];
    getReviereByPraesidium: (praesidiumId: string) => Station[];
    getPraesidiumById: (id: string) => Station | undefined;
}
export declare const useStationStore: import("zustand").UseBoundStore<import("zustand").StoreApi<StationStore>>;
export {};
