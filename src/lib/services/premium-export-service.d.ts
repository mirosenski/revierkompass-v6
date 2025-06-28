import { RouteResult, Address, Station, CustomAddress } from '../store/app-store';
export interface ExportOptions {
    includeMap?: boolean;
    includeMetadata?: boolean;
    corporateDesign?: boolean;
    format?: 'excel' | 'csv' | 'pdf' | 'json';
}
export interface ExportData {
    Ziel: string;
    Typ: string;
    Adresse: string;
    Stadt: string;
    Entfernung_km: string;
    Fahrzeit_min: string;
    Route_Typ: string;
    Koordinaten_Lat: number;
    Koordinaten_Lng: number;
    Erstellt_am: string;
}
export interface MetaData {
    exportiert_am: string;
    exportiert_von: string;
    startadresse: string;
    anzahl_ziele: number;
    kuerzeste_entfernung_km: string;
    laengste_entfernung_km: string;
    durchschnittliche_entfernung_km: string;
    kuerzeste_fahrtzeit_min: string;
    laengste_fahrtzeit_min: string;
    durchschnittliche_fahrtzeit_min: string;
    verwendete_routing_provider: string[];
    system_version: string;
}
declare class PremiumExportService {
    exportToPremiumExcel(routeResults: RouteResult[], startAddress: Address, allStations: Station[], customAddresses: CustomAddress[], options?: ExportOptions): Promise<void>;
    private createPremiumMainSheet;
    private prepareExportData;
    private createMetaData;
    private createCorporateInfoSheet;
    private createStatisticsSheet;
    private createPoliceHeaderSheet;
    exportToCSV(routeResults: RouteResult[], allStations: Station[], customAddresses: CustomAddress[]): Promise<void>;
    exportToPremiumPDF(routeResults: RouteResult[], startAddress: Address, allStations: Station[], customAddresses: CustomAddress[]): Promise<void>;
    copyToClipboard(routeResults: RouteResult[], allStations: Station[], customAddresses: CustomAddress[]): Promise<void>;
}
export declare const premiumExportService: PremiumExportService;
export {};
