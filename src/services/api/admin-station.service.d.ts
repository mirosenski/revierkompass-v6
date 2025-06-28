import { Station } from '@/types/station.types';
export interface AdminStationService {
    createStation: (station: Omit<Station, 'id' | 'lastModified'>) => Promise<Station>;
    updateStation: (id: string, updates: Partial<Station>) => Promise<Station>;
    deleteStation: (id: string) => Promise<boolean>;
    toggleStationActive: (id: string) => Promise<Station>;
    bulkUpdateStations: (updates: Array<{
        id: string;
        changes: Partial<Station>;
    }>) => Promise<Station[]>;
}
export declare const adminStationService: AdminStationService;
export declare const createStation: (station: Omit<Station, "id" | "lastModified">) => Promise<Station>;
export declare const updateStation: (id: string, updates: Partial<Station>) => Promise<Station>;
export declare const deleteStation: (id: string) => Promise<boolean>;
export declare const toggleStationActive: (id: string) => Promise<Station>;
export declare const bulkUpdateStations: (updates: Array<{
    id: string;
    changes: Partial<Station>;
}>) => Promise<Station[]>;
