import { Station } from '@/types/station.types';
export interface AdminStats {
    totalStations: number;
    totalPrecincts: number;
    totalStationHouses: number;
    routesToday: number;
    avgResponseTime: number;
    popularCities: Array<{
        city: string;
        count: number;
    }>;
    lastUpdate: Date;
}
export interface AdminState {
    allStations: Station[];
    filteredStations: Station[];
    selectedStations: string[];
    stats: AdminStats | null;
    isLoading: boolean;
    error: string | null;
    isEditing: boolean;
    editingStationId: string | null;
    searchQuery: string;
    cityFilter: string;
    typeFilter: 'all' | 'praesidium' | 'revier';
    sortBy: 'name' | 'city' | 'type';
    sortOrder: 'asc' | 'desc';
    loadStations: () => Promise<void>;
    addStation: (station: Omit<Station, 'id'>) => Promise<void>;
    updateStation: (id: string, updates: Partial<Station>) => Promise<void>;
    deleteStation: (id: string) => Promise<void>;
    deleteMultipleStations: (ids: string[]) => Promise<void>;
    importStations: (stations: Station[]) => Promise<void>;
    loadStats: () => Promise<void>;
    updateStats: () => void;
    toggleStationSelection: (id: string) => void;
    selectAllStations: () => void;
    clearSelection: () => void;
    setSearchQuery: (query: string) => void;
    setCityFilter: (city: string) => void;
    setTypeFilter: (type: 'all' | 'praesidium' | 'revier') => void;
    setSorting: (sortBy: 'name' | 'city' | 'type', order: 'asc' | 'desc') => void;
    getFilteredStations: () => Station[];
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setEditing: (editing: boolean, stationId?: string) => void;
}
export declare const useAdminStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AdminState>>;
