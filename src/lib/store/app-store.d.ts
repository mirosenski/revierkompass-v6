export interface Coordinates {
    lat: number;
    lng: number;
}
export interface Address {
    street: string;
    houseNumber: string;
    zipCode: string;
    city: string;
    fullAddress: string;
    coordinates: Coordinates;
    accuracy?: number;
}
export interface CustomAddress {
    id: string;
    name: string;
    street: string;
    zipCode: string;
    city: string;
    address: string;
    coordinates?: Coordinates;
    createdAt: Date;
    isSelected?: boolean;
}
export interface Station {
    id: string;
    name: string;
    address: string;
    coordinates: Coordinates;
    phone: string;
    email: string;
    type: 'Präsidium' | 'Revier';
    city: string;
    district: string;
    openingHours: string;
    emergency24h: boolean;
}
export interface RouteResult {
    id: string;
    destinationId: string;
    destinationName: string;
    destinationType: 'station' | 'custom';
    address: string;
    distance: number;
    duration: number;
    estimatedFuel: number;
    estimatedCost: number;
    routeType: 'Schnellste' | 'Kürzeste' | 'Ökonomisch';
    stationType?: 'Präsidium' | 'Revier';
    coordinates: Coordinates;
    color: string;
    profile?: string;
    route: {
        coordinates: [number, number][];
        distance: number;
        duration: number;
    };
    provider: 'OSRM' | 'Valhalla' | 'GraphHopper' | 'Direct';
}
export interface WizardState {
    currentStep: number;
    startAddress: Address | null;
    selectedCities: string[];
    selectedStations: string[];
    selectedCustomAddresses: string[];
    routeResults: RouteResult[];
}
export interface AppState {
    isDarkMode: boolean;
    toggleTheme: () => void;
    wizard: WizardState;
    setWizardStep: (step: number) => void;
    setStartAddress: (address: Address | null) => void;
    setSelectedCities: (cities: string[]) => void;
    setSelectedStations: (stations: string[]) => void;
    setSelectedCustomAddresses: (addresses: string[]) => void;
    setRouteResults: (results: RouteResult[]) => void;
    resetWizard: () => void;
    customAddresses: CustomAddress[];
    addCustomAddress: (address: Omit<CustomAddress, 'id' | 'createdAt' | 'address'>) => void;
    updateCustomAddress: (id: string, updates: Partial<CustomAddress>) => void;
    deleteCustomAddress: (id: string) => void;
    toggleCustomAddressSelection: (id: string) => void;
    clearCustomAddressSelection: () => void;
    isLoadingGeocode: boolean;
    isLoadingRoutes: boolean;
    isCalculating: boolean;
    setLoadingGeocode: (loading: boolean) => void;
    setLoadingRoutes: (loading: boolean) => void;
    setCalculating: (calculating: boolean) => void;
    mapCenter: [number, number];
    mapZoom: number;
    mapPitch: number;
    mapBearing: number;
    setMapView: (center: [number, number], zoom: number, pitch?: number, bearing?: number) => void;
    error: string | null;
    setError: (error: string | null) => void;
    stations: Station[];
    setStations: (stations: Station[]) => void;
}
export declare const useAppStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AppState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AppState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AppState) => void) => () => void;
        onFinishHydration: (fn: (state: AppState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AppState, unknown>>;
    };
}>;
