import React from 'react';
interface FloatingActionPanelProps {
    isPanelOpen: boolean;
    setIsPanelOpen: (open: boolean) => void;
    isLoading: boolean;
    totalSelected: number;
    selectedStations: string[];
    selectedCustomAddresses: string[];
    stations: any[];
    customAddresses: any[];
    onStationToggle: (id: string) => void;
    onCustomToggle: (id: string) => void;
}
declare const FloatingActionPanel: React.FC<FloatingActionPanelProps>;
export default FloatingActionPanel;
