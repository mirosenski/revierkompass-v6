import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Copy, Clock, MapPin, Route, Zap, BarChart3, Map, Table, WifiOff } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import InteractiveMap from '@/components/map/InteractiveMap';
import OfflineMapComponent from '../map/OfflineMapComponent';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';
import { useStationStore } from '@/store/useStationStore';
import { routingService } from '@/lib/services/routing-service';
import NoSelectionWarning from './NoSelectionWarning';
// Hilfsfunktion zur Konvertierung zwischen Station-Typen
const convertStationType = (station) => {
    return {
        id: station.id,
        name: station.name,
        address: station.address,
        coordinates: {
            lat: station.coordinates[0],
            lng: station.coordinates[1]
        },
        phone: station.telefon,
        email: '', // Nicht verfügbar in station.types.ts
        type: station.type === 'praesidium' ? 'Präsidium' : 'Revier',
        city: station.city,
        district: '', // Nicht verfügbar in station.types.ts
        openingHours: '', // Nicht verfügbar in station.types.ts
        emergency24h: station.notdienst24h
    };
};
const Step3PremiumExport = () => {
    const { selectedStations, selectedCustomAddresses } = useWizardStore();
    const { wizard: { startAddress }, customAddresses } = useAppStore();
    const { stations } = useStationStore();
    const [routeResults, setRouteResults] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [exportFormat, setExportFormat] = useState('excel');
    const [activeTab, setActiveTab] = useState('summary');
    useEffect(() => {
        const calculateRoutes = async () => {
            if (!startAddress || (!selectedStations?.length && !selectedCustomAddresses?.length)) {
                setRouteResults(null);
                return;
            }
            setIsCalculating(true);
            try {
                // Konvertiere Stationen in den erwarteten Typ
                const convertedStations = stations.map(convertStationType);
                const routes = await routingService.calculateMultipleRoutes(startAddress, selectedStations || [], selectedCustomAddresses || [], convertedStations, customAddresses || []);
                setRouteResults(routes);
                toast.success('Routenberechnung abgeschlossen!');
            }
            catch (error) {
                console.error('Routenberechnung fehlgeschlagen:', error);
                toast.error('Fehler bei der Routenberechnung');
                setRouteResults(null);
            }
            finally {
                setIsCalculating(false);
            }
        };
        if (startAddress && (selectedStations?.length || selectedCustomAddresses?.length)) {
            void calculateRoutes();
        }
    }, [startAddress, selectedStations, selectedCustomAddresses, customAddresses, stations]);
    if (!startAddress || (!selectedStations?.length && !selectedCustomAddresses?.length)) {
        return _jsx(NoSelectionWarning, {});
    }
    const results = routeResults || [];
    const tabs = [
        { id: 'summary', label: 'Zusammenfassung', icon: BarChart3 },
        { id: 'map', label: 'Interaktive Karte', icon: Map },
        { id: 'offline-map', label: 'Offline-Karte', icon: WifiOff },
        { id: 'table', label: 'Detaillierte Tabelle', icon: Table },
        { id: 'export', label: 'Export-Optionen', icon: Download }
    ];
    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        // Hauptdaten-Arbeitsblatt
        const worksheetData = [
            ['POLIZEI BADEN-WÜRTTEMBERG'],
            ['ROUTENANALYSE - REVIERKOMPASS'],
            ['Exportiert am: ' + new Date().toLocaleString('de-DE')],
            [''],
            ['Ziel', 'Typ', 'Adresse', 'Entfernung (km)', 'Fahrzeit (min)', 'Kraftstoff (L)', 'Kosten (€)', 'Route-Typ'],
            ...(results).map(result => [
                result.destinationName,
                result.destinationType === 'station' ? 'Polizeistation' : 'Eigene Adresse',
                result.address,
                result.distance,
                result.duration,
                result.estimatedFuel,
                result.estimatedCost,
                result.routeType
            ]),
            [''],
            ['ZUSAMMENFASSUNG'],
            ['Gesamtanzahl Ziele:', results.length],
            ['Gesamtentfernung (km):', results.reduce((sum, r) => sum + r.distance, 0).toFixed(1)],
            ['Gesamtfahrzeit (min):', results.reduce((sum, r) => sum + r.duration, 0)],
            ['Gesamtkraftstoff (L):', results.reduce((sum, r) => sum + r.estimatedFuel, 0).toFixed(1)],
            ['Gesamtkosten (€):', results.reduce((sum, r) => sum + r.estimatedCost, 0).toFixed(2)]
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        // Spaltenbreiten setzen
        worksheet['!cols'] = [
            { width: 35 }, // Ziel
            { width: 15 }, // Typ
            { width: 40 }, // Adresse
            { width: 15 }, // Entfernung
            { width: 15 }, // Fahrzeit
            { width: 15 }, // Kraftstoff
            { width: 12 }, // Kosten
            { width: 15 } // Route-Typ
        ];
        // Header-Styling (vereinfacht, da XLSX begrenzte Styling-Optionen hat)
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Routenanalyse');
        // Zusätzliches Arbeitsblatt mit Metadaten
        const metaData = [
            ['METADATEN'],
            [''],
            ['Export-Information'],
            ['Anwendung:', 'RevierKompass v2.0'],
            ['Organisation:', 'Polizei Baden-Württemberg'],
            ['Export-Datum:', new Date().toLocaleString('de-DE')],
            ['Anzahl Routen:', results.length],
            [''],
            ['Routing-Parameter'],
            ['Provider:', 'OSRM, Valhalla, GraphHopper'],
            ['Optimierung:', 'Multi-Provider Fallback'],
            ['Kraftstoffpreis:', '1.75 €/L (Durchschnitt)'],
            ['Verbrauch:', '9.5 L/100km (Annahme)']
        ];
        const metaWorksheet = XLSX.utils.aoa_to_sheet(metaData);
        metaWorksheet['!cols'] = [{ width: 20 }, { width: 30 }];
        XLSX.utils.book_append_sheet(workbook, metaWorksheet, 'Metadaten');
        // Datei speichern
        const fileName = `Polizei_Routen_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        toast.success('Excel-Datei erfolgreich exportiert!');
    };
    const exportToPDF = () => {
        // Vereinfachter PDF-Export (in production würde hier jsPDF oder ähnliches verwendet)
        const content = results.map(result => `${result.destinationName} | ${result.address} | ${result.distance}km | ${result.duration}min`).join('\n');
        const blob = new Blob([
            'POLIZEI BADEN-WÜRTTEMBERG - ROUTENANALYSE\n',
            '=====================================\n\n',
            content,
            '\n\nExportiert am: ' + new Date().toLocaleString('de-DE')
        ], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Polizei_Routen_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('PDF-Export simuliert (TXT-Datei)');
    };
    const exportToCSV = () => {
        const headers = ['Ziel', 'Typ', 'Adresse', 'Entfernung_km', 'Fahrzeit_min', 'Kraftstoff_L', 'Kosten_EUR', 'Route_Typ'];
        const csvContent = [
            headers.join(','),
            ...results.map(result => [
                `"${result.destinationName}"`,
                result.destinationType === 'station' ? 'Polizeistation' : 'Eigene_Adresse',
                `"${result.address}"`,
                result.distance,
                result.duration,
                result.estimatedFuel,
                result.estimatedCost,
                result.routeType
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Polizei_Routen_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('CSV-Datei erfolgreich exportiert!');
    };
    const copyToClipboard = () => {
        const content = results.map(result => `${result.destinationName}\t${result.address}\t${result.distance} km\t${result.duration} min`).join('\n');
        navigator.clipboard.writeText(content).then(() => {
            toast.success('Daten in Zwischenablage kopiert!');
        }).catch(() => {
            toast.error('Fehler beim Kopieren in die Zwischenablage');
        });
    };
    const getExportHandler = () => {
        switch (exportFormat) {
            case 'excel': return exportToExcel;
            case 'pdf': return exportToPDF;
            case 'csv': return exportToCSV;
            default: return exportToExcel;
        }
    };
    const totalDistance = results.reduce((sum, r) => sum + r.distance, 0);
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const totalFuel = results.reduce((sum, r) => sum + r.estimatedFuel, 0);
    const totalCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);
    const renderTableTab = () => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6", children: [_jsx("h3", { className: "text-xl font-bold", children: "Detaillierte Routenergebnisse" }), _jsx("p", { className: "text-blue-100 mt-1", children: "Optimierte Routen zu allen ausgew\u00E4hlten Zielen" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300", children: "Ziel" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300", children: "Typ" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300", children: "Adresse" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300", children: "Entfernung" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300", children: "Fahrzeit" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300", children: "Kraftstoff" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300", children: "Kosten" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300", children: "Route-Typ" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-600", children: results.map((result, index) => (_jsxs(motion.tr, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900 dark:text-white", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: result.color } }), result.destinationName] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600 dark:text-gray-300", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${result.destinationType === 'station'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'}`, children: result.destinationType === 'station' ? 'Polizeistation' : 'Eigene Adresse' }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600 dark:text-gray-300", children: result.address }), _jsxs("td", { className: "px-6 py-4 text-sm font-medium text-gray-900 dark:text-white", children: [result.distance.toFixed(1), " km"] }), _jsxs("td", { className: "px-6 py-4 text-sm text-gray-600 dark:text-gray-300", children: [result.duration, " min"] }), _jsxs("td", { className: "px-6 py-4 text-sm text-gray-600 dark:text-gray-300", children: [result.estimatedFuel.toFixed(1), " L"] }), _jsxs("td", { className: "px-6 py-4 text-sm font-medium text-gray-900 dark:text-white", children: ["\u20AC", result.estimatedCost.toFixed(2)] }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600 dark:text-gray-300", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${result.routeType === 'Schnellste'
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                                : result.routeType === 'Kürzeste'
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'}`, children: result.routeType }) })] }, result.id))) })] }) })] }));
    const renderExportTab = () => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 dark:text-white mb-6", children: "Premium Export-Optionen" }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3", children: "Export-Format ausw\u00E4hlen:" }), _jsx("div", { className: "flex space-x-4", children: [
                            { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'green' },
                            { id: 'pdf', label: 'PDF (.pdf)', icon: FileText, color: 'red' },
                            { id: 'csv', label: 'CSV (.csv)', icon: FileSpreadsheet, color: 'blue' }
                        ].map((format) => {
                            const Icon = format.icon;
                            return (_jsxs("button", { onClick: () => setExportFormat(format.id), className: `flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${exportFormat === format.id
                                    ? `border-${format.color}-500 bg-${format.color}-50 dark:bg-${format.color}-900/20 text-${format.color}-700 dark:text-${format.color}-300`
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'}`, children: [_jsx(Icon, { className: "h-5 w-5" }), _jsx("span", { className: "font-medium", children: format.label })] }, format.id));
                        }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: getExportHandler(), className: "flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200", children: [_jsx(FileSpreadsheet, { className: "h-5 w-5" }), _jsx("span", { children: "Premium Export" })] }), _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: copyToClipboard, className: "flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200", children: [_jsx(Copy, { className: "h-5 w-5" }), _jsx("span", { children: "Zwischenablage" })] }), _jsxs("button", { onClick: exportToCSV, className: "flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200", children: [_jsx(FileText, { className: "h-5 w-5" }), _jsx("span", { children: "CSV Export" })] }), _jsxs("button", { onClick: exportToPDF, className: "flex items-center justify-center space-x-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200", children: [_jsx(FileText, { className: "h-5 w-5" }), _jsx("span", { children: "PDF Export" })] })] })] }));
    const renderTabContent = () => {
        switch (activeTab) {
            case 'summary':
                return renderSummaryTab();
            case 'map':
                return renderMapTab();
            case 'offline-map':
                return renderOfflineMapTab();
            case 'table':
                return renderTableTab();
            case 'export':
                return renderExportTab();
            default:
                return renderSummaryTab();
        }
    };
    const renderSummaryTab = () => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(MapPin, { className: "h-8 w-8 text-blue-600 dark:text-blue-400" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: results.length }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Ziele" })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Route, { className: "h-8 w-8 text-green-600 dark:text-green-400" }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: [totalDistance.toFixed(1), " km"] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Gesamtstrecke" })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Clock, { className: "h-8 w-8 text-purple-600 dark:text-purple-400" }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: [Math.floor(totalDuration / 60), "h ", totalDuration % 60, "min"] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Gesamtzeit" })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Zap, { className: "h-8 w-8 text-orange-600 dark:text-orange-400" }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: ["\u20AC", totalCost.toFixed(2)] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Gesch\u00E4tzte Kosten" })] })] }) })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Routen\u00FCbersicht" }), _jsx("div", { className: "space-y-3", children: results.map((result, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-4 h-4 rounded-full", style: { backgroundColor: result.color } }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: result.destinationName }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: result.address })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900 dark:text-white", children: [result.distance.toFixed(1), " km"] }), _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: [result.duration, " min"] })] })] }, result.id))) })] })] }));
    const renderMapTab = () => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "space-y-6", children: _jsx(InteractiveMap, { routeResults: routeResults || [], startAddress: startAddress?.fullAddress || '', startCoordinates: startAddress?.coordinates || { lat: 0, lng: 0 } }) }));
    const renderOfflineMapTab = () => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "space-y-6", children: [_jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(WifiOff, { className: "h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2", children: "Offline-Kartenfunktionen f\u00FCr Baden-W\u00FCrttemberg" }), _jsx("p", { className: "text-blue-800 dark:text-blue-200 text-sm mb-4", children: "Diese Karte bietet erweiterte Offline-Funktionen speziell f\u00FCr den Einsatz in Baden-W\u00FCrttemberg. Alle Kartendaten, Routing-Profile und NBAN-Zonen sind lokal verf\u00FCgbar." }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("span", { className: "text-blue-800 dark:text-blue-200", children: "Offline-Kacheln" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("span", { className: "text-blue-800 dark:text-blue-200", children: "Lokales Routing" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("span", { className: "text-blue-800 dark:text-blue-200", children: "NBAN-Zonen" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("span", { className: "text-blue-800 dark:text-blue-200", children: "Einsatz-Profile" })] })] })] })] }) }), _jsx(OfflineMapComponent, { routeResults: routeResults || [], startAddress: startAddress?.fullAddress || '', startCoordinates: startAddress?.coordinates || { lat: 0, lng: 0 }, showOfflineControls: true, onRouteRecalculate: (routeId, profile) => {
                    // Hier würde die Route mit dem neuen Profil neu berechnet
                    console.log(`Recalculating route ${routeId} with profile ${profile}`);
                    // In einer echten Implementierung würden hier die Routen-Daten aktualisiert
                } })] }));
    return (_jsxs("div", { className: "max-w-7xl mx-auto space-y-8", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "text-center", children: _jsxs("div", { className: "inline-flex items-center space-x-3 mb-6", children: [_jsx("div", { className: "bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-2xl shadow-lg", children: _jsx(Download, { className: "h-8 w-8 text-white" }) }), _jsxs("div", { className: "text-left", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Export & Ergebnisse" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "Ihre Routenergebnisse sind bereit zum Export" })] })] }) }), isCalculating ? (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl shadow-xl text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6" }), _jsx("h3", { className: "text-2xl font-bold mb-2", children: "Routenberechnung l\u00E4uft..." }), _jsx("p", { className: "text-blue-100", children: "Multi-Provider Routing wird durchgef\u00FChrt (OSRM, Valhalla, GraphHopper)" }), _jsxs("div", { className: "mt-4 flex justify-center space-x-6 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx("span", { children: "Gesch\u00E4tzte Zeit: 3-5 Sekunden" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Zap, { className: "h-4 w-4" }), _jsx("span", { children: "Optimale Routen werden berechnet" })] })] })] })) : (routeResults && (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2", children: _jsx("div", { className: "flex space-x-1", children: tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`, children: [_jsx(Icon, { className: "h-5 w-5" }), _jsx("span", { children: tab.label })] }, tab.id));
                            }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "min-h-[600px]", children: renderTabContent() }, activeTab)] })))] }));
};
export default Step3PremiumExport;
