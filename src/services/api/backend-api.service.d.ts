import { Station } from '@/types/station.types';
export declare const fetchStations: (params?: {}) => Promise<Station[]>;
export declare const createStation: (station: Omit<Station, "id" | "lastModified">) => Promise<Station>;
export declare const updateStation: (id: string, station: Partial<Station>) => Promise<Station>;
export declare const deleteStation: (id: string) => Promise<void>;
