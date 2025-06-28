import React from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RouteResult } from '@/lib/store/app-store';
interface InteractiveMapProps {
    routeResults: RouteResult[];
    startAddress: string;
    startCoordinates: {
        lat: number;
        lng: number;
    };
    onMarkerClick?: (route: RouteResult) => void;
}
declare const InteractiveMap: React.FC<InteractiveMapProps>;
export default InteractiveMap;
