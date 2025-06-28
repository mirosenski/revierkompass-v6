import React from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RouteResult } from '@/lib/store/app-store';
interface OfflineMapComponentProps {
    routeResults: RouteResult[];
    startAddress: string;
    startCoordinates: {
        lat: number;
        lng: number;
    };
    showOfflineControls?: boolean;
    onRouteRecalculate?: (routeId: string, profile: string) => void;
}
declare const OfflineMapComponent: React.FC<OfflineMapComponentProps>;
export default OfflineMapComponent;
