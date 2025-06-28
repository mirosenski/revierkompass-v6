export interface PoliceStation {
    id: string;
    name: string;
    type: string;
    city: string;
    address?: string;
    coordinates?: [number, number];
    telefon?: string;
    email?: string;
    notdienst24h: boolean;
    isActive: boolean;
    parentId?: string;
    lastModified: string;
}
export interface CreateStationData {
    name: string;
    type: string;
    city: string;
    address?: string;
    coordinates?: [number, number];
    telefon?: string;
    email?: string;
    notdienst24h?: boolean;
    isActive?: boolean;
    parentId?: string;
}
export interface UpdateStationData extends Partial<CreateStationData> {
}
declare class ApiError extends Error {
    status: number;
    data?: any;
    constructor(message: string, status: number, data?: any);
}
export declare const api: {
    health: () => Promise<{
        status: string;
        timestamp: string;
        version: string;
    }>;
    stations: {
        getAll: () => Promise<PoliceStation[]>;
        getById: (id: string) => Promise<PoliceStation>;
        create: (data: CreateStationData) => Promise<PoliceStation>;
        update: (id: string, data: UpdateStationData) => Promise<PoliceStation>;
        delete: (id: string) => Promise<void>;
    };
};
export declare const useStations: () => {
    queryKey: string[];
    queryFn: () => Promise<PoliceStation[]>;
};
export declare const useStation: (id: string) => {
    queryKey: string[];
    queryFn: () => Promise<PoliceStation>;
    enabled: boolean;
};
export { ApiError };
