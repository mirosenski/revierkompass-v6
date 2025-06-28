import React from 'react';
import { FilterState } from './types';
interface StationFiltersProps {
    filters: FilterState;
    onFilterChange: (field: keyof FilterState, value: any) => void;
    onClearFilters: () => void;
    allCities: string[];
    hasActiveFilters: boolean;
    filteredStationsCount: number;
}
export declare const StationFilters: React.FC<StationFiltersProps>;
export {};
