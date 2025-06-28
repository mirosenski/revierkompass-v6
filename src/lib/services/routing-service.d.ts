import { Coordinates, Address, RouteResult, Station, CustomAddress } from '../store/app-store';
export interface RouteRequest {
    start: Coordinates;
    end: Coordinates;
}
export interface RouteResponse {
    coordinates: [number, number][];
    distance: number;
    duration: number;
}
declare class RoutingService {
    private readonly OSRM_BASE_URL;
    private readonly VALHALLA_BASE_URL;
    private readonly GRAPHHOPPER_BASE_URL;
    private readonly routeCache;
    private readonly MAX_CACHE_SIZE;
    private buildOSRMUrl;
    private readonly OSRM_FALLBACK_URLS;
    calculateMultipleRoutes(startAddress: Address, selectedStationIds: string[], selectedCustomAddressIds: string[], allStations: Station[], customAddresses: CustomAddress[]): Promise<RouteResult[]>;
    calculateSingleRoute(start: Coordinates, end: Coordinates): Promise<RouteResponse>;
    private calculateWithOSRM;
    private createFallbackRoute;
    private saveToCache;
    private calculateWithValhalla;
    private generateRouteColor;
    calculateDirectDistance(start: Coordinates, end: Coordinates): number;
    private decodePolyline;
    private degreesToRadians;
}
export declare const routingService: RoutingService;
export {};
