interface NetworkStatus {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
}
interface OfflineCapabilities {
    osrm: boolean;
    valhalla: boolean;
    tileserver: boolean;
    nominatim: boolean;
    offline_mode: boolean;
}
interface RouteProfile {
    id: string;
    name: string;
    mode: string;
    costing: string;
    description: string;
    icon: string;
    useCase: string;
}
interface RouteRequest {
    start: {
        lat: number;
        lon: number;
    };
    end: {
        lat: number;
        lon: number;
    };
    profile?: string;
    alternatives?: number;
}
interface RouteResult {
    trip: {
        legs: Array<{
            shape: string;
            distance: number;
            time: number;
            summary: {
                length: number;
                time: number;
            };
        }>;
        summary: {
            length: number;
            time: number;
        };
    };
    profile?: string;
    name?: string;
}
interface MapStyle {
    name: string;
    description: string;
    thumbnail: string;
}
export declare class OfflineMapService {
    private baseUrl;
    private networkStatus;
    private offlineCapabilities;
    private tileCache;
    private routeCache;
    private isInitialized;
    constructor(baseUrl?: string);
    /**
     * Initialize the offline map service
     */
    initialize(): Promise<boolean>;
    /**
     * Check if offline services are available
     */
    checkCapabilities(): Promise<OfflineCapabilities>;
    /**
     * Get current network status
     */
    getNetworkStatus(): NetworkStatus;
    /**
     * Check if we're in offline mode
     */
    isOfflineMode(): boolean;
    /**
     * Get available map styles
     */
    getMapStyles(): Promise<Record<string, MapStyle>>;
    /**
     * Get map style configuration
     */
    getMapStyle(styleId: string): Promise<any>;
    /**
     * Calculate route using offline or online services
     */
    calculateRoute(request: RouteRequest): Promise<RouteResult>;
    /**
     * Get multiple route alternatives
     */
    calculateAlternativeRoutes(start: {
        lat: number;
        lon: number;
    }, end: {
        lat: number;
        lon: number;
    }, profiles?: string[]): Promise<RouteResult[]>;
    /**
     * Get available routing profiles
     */
    getRoutingProfiles(): Promise<RouteProfile[]>;
    /**
     * Geocode address using offline Nominatim
     */
    geocodeAddress(query: string): Promise<Array<{
        lat: number;
        lon: number;
        display_name: string;
        importance: number;
        place_id: string;
    }>>;
    /**
     * Get NBAN (special zones) data
     */
    getNBANData(bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
    }): Promise<any>;
    /**
     * Preload tiles for offline use
     */
    preloadTiles(style: string, bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    }, minZoom?: number, maxZoom?: number, onProgress?: (progress: number) => void): Promise<void>;
    /**
     * Clear offline cache
     */
    clearOfflineCache(): Promise<void>;
    private initializeNetworkMonitoring;
    private registerServiceWorker;
    private loadCachedData;
    private updateSourceUrlsForOffline;
    private calculateFallbackRoute;
    private calculateDistance;
    private calculateTileList;
    private deg2tile;
    private preloadSingleTile;
}
export declare const offlineMapService: OfflineMapService;
export {};
