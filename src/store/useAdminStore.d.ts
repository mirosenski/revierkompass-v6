import { Station } from '@/types/station.types';
interface AdminStore {
    stations: Station[];
    isLoading: boolean;
    error: string | null;
    loadStations: (params?: {
        all: boolean;
        take: number;
    }) => Promise<void>;
    createStation: (station: Omit<Station, 'id' | 'lastModified'>) => Promise<void>;
    updateStation: (id: string, updates: Partial<Station>) => Promise<void>;
    deleteStation: (id: string) => Promise<void>;
}
export declare const useAdminStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AdminStore>>;
export {};
