import React from 'react';
interface TabContentProps {
    activeTab: 'stations' | 'custom';
    activeView: 'grid' | 'list' | 'compact' | 'map';
    searchQuery: string;
    praesidiumWithReviere: any[];
    selectedStations: string[];
    expandedPraesidien: Set<string>;
    customAddresses: any[];
    selectedCustomAddresses: string[];
    routes: any[];
    showAddForm: boolean;
    formData: any;
    setFormData: (data: any) => void;
    onTogglePraesidium: (id: string) => void;
    onExpandPraesidium: (id: string) => void;
    onStationToggle: (id: string) => void;
    onCustomToggle: (id: string) => void;
    onAddAddress: () => void;
    onCancelAddForm: () => void;
    onToggleAddForm: () => void;
    onMarkerClick: (route: any) => void;
}
declare const TabContent: React.FC<TabContentProps>;
export default TabContent;
