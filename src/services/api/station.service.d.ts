import { Station } from '@/types/station.types';
export declare const stationService: {
    getAllStations: () => Promise<Station[]>;
    getStationById: (id: string) => Promise<Station | null>;
    getStationsByType: (type: "praesidium" | "revier") => Promise<Station[]>;
    getReviereByPraesidium: (praesidiumId: string) => Promise<Station[]>;
};
