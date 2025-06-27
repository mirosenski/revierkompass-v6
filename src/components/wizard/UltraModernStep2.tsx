// UltraModernStep2.tsx (Komplett überarbeitet)
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, MapPin, ChevronDown, Search,
  LayoutGrid, LayoutList, Plus, Mic, Command, CheckCircle2, Trash2, Users, ArrowRight
} from 'lucide-react';
import { useStationStore } from '@/store/useStationStore';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore, RouteResult } from '@/lib/store/app-store';
import ModernNavigation from '../ModernNavigation';
import toast from 'react-hot-toast';
import InteractiveMap from '@/components/map/InteractiveMap';

// Neue Interfaces für moderne UI
interface Revier {
  id: string;
  name: string;
  address: string;
  telefon?: string;
}

interface Praesidium {
  id: string;
  name: string;
  address: string;
  city: string;
  telefon?: string;
  reviere: Revier[];
  selectedCount: number;
}

interface PraesidiumCardProps {
  praesidium: Praesidium;
  onToggle: (id: string) => void;
  onExpand: () => void;
  onStationToggle: (id: string) => void;
  selectedStations: string[];
  viewMode: 'grid' | 'list' | 'compact' | 'map';
  expandedPraesidien: Set<string>;
}

// Animation Variants
const animationVariants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  },
  card: {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  }
};

// Neue UI-Komponenten
const PraesidiumCard: React.FC<PraesidiumCardProps> = ({
  praesidium,
  onToggle,
  onExpand,
  onStationToggle,
  selectedStations,
  viewMode,
  expandedPraesidien
}) => {
  const isSelected = selectedStations.includes(praesidium.id);
  const selectedReviere = praesidium.reviere.filter(r => selectedStations.includes(r.id));

  return (
    <motion.div
      variants={animationVariants.card}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={`p-6 rounded-xl border transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
      }`}
      onClick={() => onToggle(praesidium.id)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <Building className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {praesidium.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {praesidium.address}
            </p>
            {praesidium.telefon && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {praesidium.telefon}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {praesidium.selectedCount > 0 && (
            <div className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              {praesidium.selectedCount}/{praesidium.reviere.length}
            </div>
          )}
          <CheckCircle2 className={`h-6 w-6 transition-colors ${
            isSelected ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'
          }`} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
          >
            <ChevronDown 
              className={`h-5 w-5 text-gray-400 transition-transform ${
                expandedPraesidien.has(praesidium.id) ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
      </div>
      
      {viewMode === 'list' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Auswahl-Fortschritt</span>
            <span>{selectedReviere.length}/{praesidium.reviere.length}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedReviere.length / praesidium.reviere.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <AnimatePresence>
          {expandedPraesidien.has(praesidium.id) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {praesidium.reviere.map(revier => (
                <div 
                  key={revier.id}
                  className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                    selectedStations.includes(revier.id)
                      ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStationToggle(revier.id);
                  }}
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium">{revier.name}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {revier.address}
                    </p>
                    {revier.telefon && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {revier.telefon}
                      </p>
                    )}
                  </div>
                  <CheckCircle2 className={`h-5 w-5 transition-colors ${
                    selectedStations.includes(revier.id) 
                      ? 'text-blue-500' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

const ViewSwitcher: React.FC<{ 
  activeView: 'grid' | 'list' | 'compact' | 'map'; 
  setActiveView: (view: 'grid' | 'list' | 'compact' | 'map') => void;
}> = ({ activeView, setActiveView }) => (
  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex space-x-1">
    {['grid', 'list', 'compact', 'map'].map((view, i) => (
      <button
        key={view}
        className={`p-2 rounded-md transition-all ${
          activeView === view 
            ? 'bg-white dark:bg-gray-800 shadow text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveView(view as any)}
        aria-label={`${view} view`}
        title={`${view === 'grid' ? 'Raster' : view === 'list' ? 'Liste' : view === 'compact' ? 'Kompakt' : 'Karte'} Ansicht`}
      >
        {view === 'grid' && <LayoutGrid className="h-5 w-5" />}
        {view === 'list' && <LayoutList className="h-5 w-5" />}
        {view === 'compact' && <div className="h-5 w-5 grid grid-cols-3 gap-0.5">
          <div className="bg-current rounded-sm" />
          <div className="bg-current rounded-sm" />
          <div className="bg-current rounded-sm" />
          <div className="bg-current rounded-sm" />
          <div className="bg-current rounded-sm" />
          <div className="bg-current rounded-sm" />
          <div className="bg-current rounded-sm" />
          <div className="bg-current rounded-sm" />
          <div className="bg-current rounded-sm" />
        </div>}
        {view === 'map' && <div className="h-5 w-5 bg-current rounded-full" />}
      </button>
    ))}
  </div>
);

const SearchBar: React.FC<{ 
  searchQuery: string; 
  setSearchQuery: (query: string) => void;
}> = ({ searchQuery, setSearchQuery }) => (
  <div className="relative mb-6">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    <input
      type="text"
      placeholder="Suche nach Präsidien, Revieren oder Städten..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-12 pr-32 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 
               dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 
               focus:border-transparent transition-all text-gray-900 dark:text-white"
    />
    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <Mic className="h-5 w-5 text-gray-500" />
    </button>
  </div>
);

// Hilfsfunktion für alle Marker (Präsidien + Reviere)
function buildAllMapMarkers(stations) {
  const praesidien = stations.filter(s => s.type === 'praesidium' && s.coordinates);
  const reviere = stations.filter(s => s.type === 'revier' && s.coordinates);

  return [
    ...praesidien.map(p => ({
      id: p.id,
      destinationId: p.id,
      destinationName: p.name,
      destinationType: 'station',
      address: p.address,
      coordinates: { lat: p.coordinates[0], lng: p.coordinates[1] },
      color: '#2563eb',
      distance: 0,
      duration: 0,
      estimatedFuel: 0,
      estimatedCost: 0,
      routeType: 'Schnellste',
      stationType: 'Präsidium',
      route: { coordinates: [[p.coordinates[1], p.coordinates[0]]], distance: 0, duration: 0 },
      provider: 'Direct'
    })),
    ...reviere.map(r => ({
      id: r.id,
      destinationId: r.id,
      destinationName: r.name,
      destinationType: 'station',
      address: r.address,
      coordinates: { lat: r.coordinates[0], lng: r.coordinates[1] },
      color: '#22c55e',
      distance: 0,
      duration: 0,
      estimatedFuel: 0,
      estimatedCost: 0,
      routeType: 'Schnellste',
      stationType: 'Revier',
      route: { coordinates: [[r.coordinates[1], r.coordinates[0]]], distance: 0, duration: 0 },
      provider: 'Direct'
    }))
  ];
}

const UltraModernStep2: React.FC = () => {
  // States
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'compact' | 'map'>('grid');
  const [activeTab, setActiveTab] = useState<'stations' | 'custom'>('stations');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedPraesidien, setExpandedPraesidien] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    zipCode: '',
    city: ''
  });

  // Routing state
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [routeCache, setRouteCache] = useState<Record<string, RouteResult>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Store-Hooks
  const { stations, getStationsByType, getReviereByPraesidium, loadStations } = useStationStore();
  const { selectedStations, setSelectedStations, selectedCustomAddresses, setSelectedCustomAddresses, setStep } = useWizardStore();
  const { customAddresses, addCustomAddress, deleteCustomAddress, setWizardStep } = useAppStore();

  // Fetch routes from OSRM with rate limiting and better error handling
  const fetchRoutes = async () => {
    setIsLoading(true);
    const startCoords = { lat: 48.7784, lng: 9.1806 };
    
    // Im Map-View alle Stationen routen, sonst nur ausgewählte
    const selectedStationIds = new Set(selectedStations);
    const shouldRouteAll = activeView === 'map' || selectedStations.length === 0;
    
    const allDestinations = [
      ...stations
        .filter(s => s.type === 'praesidium' && s.coordinates && (shouldRouteAll || selectedStationIds.has(s.id)))
        .map(p => ({
          id: p.id,
          coordinates: { lat: p.coordinates[0], lng: p.coordinates[1] },
          type: 'praesidium',
          name: p.name,
          address: p.address
        })),
      ...stations
        .filter(s => s.type === 'revier' && s.coordinates && (shouldRouteAll || selectedStationIds.has(s.id)))
        .map(r => ({
          id: r.id,
          coordinates: { lat: r.coordinates[0], lng: r.coordinates[1] },
          type: 'revier',
          name: r.name,
          address: r.address
        }))
    ];

    // Wenn keine Stationen gefunden wurden, alle anzeigen
    if (allDestinations.length === 0) {
      const allStationDestinations = [
        ...stations
          .filter(s => s.type === 'praesidium' && s.coordinates)
          .map(p => ({
            id: p.id,
            coordinates: { lat: p.coordinates[0], lng: p.coordinates[1] },
            type: 'praesidium',
            name: p.name,
            address: p.address
          })),
        ...stations
          .filter(s => s.type === 'revier' && s.coordinates)
          .map(r => ({
            id: r.id,
            coordinates: { lat: r.coordinates[0], lng: r.coordinates[1] },
            type: 'revier',
            name: r.name,
            address: r.address
          }))
      ];
      allDestinations.push(...allStationDestinations);
    }

    // Test-Route hinzufügen für Debugging
    if (allDestinations.length === 0) {
      allDestinations.push({
        id: 'test-route',
        coordinates: { lat: 48.7758, lng: 9.1829 }, // Stuttgart Hauptbahnhof
        type: 'praesidium',
        name: 'Test Route',
        address: 'Stuttgart Hauptbahnhof'
      });
    }

    console.log('🗺️ Starte Routenberechnung für', allDestinations.length, 'Ziele');

    try {
      // Rate limiting: Verarbeite Routen in Batches von 3
      const batchSize = 3;
      const newRoutes: RouteResult[] = [];
      
      for (let i = 0; i < allDestinations.length; i += batchSize) {
        const batch = allDestinations.slice(i, i + batchSize);
        
        const batchRoutes = await Promise.all(
          batch.map(async dest => {
            // Sicherstellen, dass die ID gültig ist
            if (!dest.id || dest.id === 'undefined' || dest.id === 'null' || isNaN(Number(dest.id))) {
              console.warn('Invalid destination ID:', dest.id, 'for destination:', dest.name);
              return null;
            }

            const cacheKey = `${startCoords.lat}-${dest.coordinates.lat}-${dest.coordinates.lng}`;

            if (routeCache[cacheKey]) {
              return routeCache[cacheKey];
            }

            try {
              // OSRM API mit Timeout und Retry-Logic
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Timeout

              const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${dest.coordinates.lng},${dest.coordinates.lat}?overview=full&geometries=geojson`,
                {
                  signal: controller.signal,
                  headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Revierkompass/1.0'
                  }
                }
              );

              clearTimeout(timeoutId);

              if (response.status === 429) {
                // Rate limit erreicht - warte und verwende Fallback
                console.warn(`Rate limit reached for ${dest.name}, using fallback`);
                throw new Error('Rate limit reached');
              }

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }

              const data = await response.json();

              if (data.code !== 'Ok' || !data.routes?.[0]) {
                throw new Error('No route found');
              }

              const osrmRoute = data.routes[0];
              const newRoute: RouteResult = {
                id: dest.id,
                destinationId: dest.id,
                destinationName: dest.name,
                destinationType: 'station',
                address: dest.address,
                coordinates: dest.coordinates,
                color: dest.type === 'praesidium' ? '#2563eb' : '#22c55e',
                distance: osrmRoute.distance / 1000,
                duration: Math.round(osrmRoute.duration / 60),
                estimatedFuel: (osrmRoute.distance / 1000) * 0.07,
                estimatedCost: (osrmRoute.distance / 1000) * 0.07 * 1.8,
                routeType: 'Schnellste',
                stationType: dest.type === 'praesidium' ? 'Präsidium' : 'Revier',
                route: {
                  coordinates: osrmRoute.geometry.coordinates,
                  distance: osrmRoute.distance / 1000,
                  duration: Math.round(osrmRoute.duration / 60)
                },
                provider: 'OSRM'
              };

              setRouteCache(prev => ({ ...prev, [cacheKey]: newRoute }));
              return newRoute;
            } catch (error) {
              console.warn(`Error routing to ${dest.name}:`, error);
              
              // Berechne Luftlinien-Distanz als Fallback
              const lat1 = startCoords.lat * Math.PI / 180;
              const lat2 = dest.coordinates.lat * Math.PI / 180;
              const deltaLat = (dest.coordinates.lat - startCoords.lat) * Math.PI / 180;
              const deltaLng = (dest.coordinates.lng - startCoords.lng) * Math.PI / 180;
              
              const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                       Math.cos(lat1) * Math.cos(lat2) *
                       Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = 6371 * c; // Erdradius in km
              
              return {
                id: dest.id,
                destinationId: dest.id,
                destinationName: dest.name,
                destinationType: 'station',
                address: dest.address,
                coordinates: dest.coordinates,
                color: dest.type === 'praesidium' ? '#2563eb' : '#22c55e',
                distance: distance,
                duration: Math.round(distance * 2), // Geschätzte Fahrzeit (2 min/km)
                estimatedFuel: distance * 0.07,
                estimatedCost: distance * 0.07 * 1.8,
                routeType: 'Schnellste',
                stationType: dest.type === 'praesidium' ? 'Präsidium' : 'Revier',
                route: {
                  coordinates: [
                    [startCoords.lng, startCoords.lat],
                    [dest.coordinates.lng, dest.coordinates.lat]
                  ],
                  distance: distance,
                  duration: Math.round(distance * 2)
                },
                provider: 'Direct'
              } as RouteResult;
            }
          })
        );

        // Filtere null-Werte heraus
        const validRoutes = batchRoutes.filter(route => route !== null) as RouteResult[];
        newRoutes.push(...validRoutes);

        // Warte zwischen Batches um Rate-Limiting zu vermeiden
        if (i + batchSize < allDestinations.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1s Pause
        }
      }

      setRoutes(newRoutes);
      console.log('🗺️ Routen berechnet:', newRoutes.length, 'für', allDestinations.length, 'Ziele');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load stations on mount
  useEffect(() => {
    console.log('🔄 Lade Stationen...');
    loadStations();
  }, [loadStations]);
  
  // Präsidien mit Revieren und selectedCount
  const praesidien = getStationsByType('praesidium');
  const praesidiumWithReviere = praesidien.map(praesidium => ({
    ...praesidium,
    reviere: getReviereByPraesidium(praesidium.id),
    isExpanded: expandedPraesidien.has(praesidium.id),
    selectedCount: getReviereByPraesidium(praesidium.id)
      .filter(r => selectedStations.includes(r.id)).length
  }));

  // Debug: Log wenn Stationen geladen sind
  useEffect(() => {
    console.log('📊 Stationen geladen:', stations.length);
    console.log('📊 Präsidien:', praesidien.length);
    console.log('📊 Ausgewählte Stationen:', selectedStations.length);
    console.log('📊 Ausgewählte Custom Addresses:', selectedCustomAddresses.length);
  }, [stations, praesidien, selectedStations, selectedCustomAddresses]);

  // Fetch routes once stations are loaded or selection changes
  useEffect(() => {
    if (stations.length > 0) {
      fetchRoutes();
    }
  }, [stations, selectedStations, activeView]);

  // Screen reader helper
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  // Toggle für Präsidium mit allen Revieren
  const togglePraesidiumWithReviere = (praesidiumId: string) => {
    const praesidium = praesidiumWithReviere.find(p => p.id === praesidiumId);
    if (!praesidium) return;

    const reviereIds = praesidium.reviere.map(r => r.id);
    const allIds = [praesidiumId, ...reviereIds];
    
    // Prüfen ob bereits alle ausgewählt sind
    const allSelected = allIds.every(id => selectedStations.includes(id));
    
    if (allSelected) {
      setSelectedStations(selectedStations.filter(id => !allIds.includes(id)));
      announceToScreenReader(`${praesidium.name} und alle Reviere abgewählt`);
    } else {
      setSelectedStations([...selectedStations.filter(id => !allIds.includes(id)), ...allIds]);
      announceToScreenReader(`${praesidium.name} und alle Reviere ausgewählt`);
    }
  };

  // Einzelne Station umschalten
  const handleStationToggle = (stationId: string) => {
    if (selectedStations.includes(stationId)) {
      setSelectedStations(selectedStations.filter(id => id !== stationId));
    } else {
      setSelectedStations([...selectedStations, stationId]);
    }
  };

  // Toggle Dropdown für Präsidium
  const togglePraesidiumExpansion = (praesidiumId: string) => {
    console.log('Expanding:', praesidiumId, 'Current state:', Array.from(expandedPraesidien));
    setExpandedPraesidien(prev => {
      const next = new Set(prev);
      if (next.has(praesidiumId)) {
        next.delete(praesidiumId);
      } else {
        next.add(praesidiumId);
      }
      return next;
    });
  };

  // Custom Address Toggle
  const handleCustomToggle = (addressId: string) => {
    if (selectedCustomAddresses.includes(addressId)) {
      setSelectedCustomAddresses(selectedCustomAddresses.filter(id => id !== addressId));
    } else {
      setSelectedCustomAddresses([...selectedCustomAddresses, addressId]);
    }
  };

  // Add Custom Address
  const handleAddAddress = () => {
    if (!formData.name.trim() || !formData.street.trim() || !formData.zipCode.trim() || !formData.city.trim()) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    addCustomAddress({
      name: formData.name,
      street: formData.street,
      zipCode: formData.zipCode,
      city: formData.city
    });
    
    setFormData({ name: '', street: '', zipCode: '', city: '' });
    setShowAddForm(false);
    toast.success('Adresse erfolgreich hinzugefügt');
    announceToScreenReader('Neue Adresse hinzugefügt');
  };

  // Delete Custom Address
  const handleDeleteAddress = (addressId: string) => {
    deleteCustomAddress(addressId);
    const updated = selectedCustomAddresses.filter(id => id !== addressId);
    setSelectedCustomAddresses(updated);
    toast.success('Adresse gelöscht');
  };

  // Voice Commands
  const handleVoiceCommand = (command: string) => {
    console.log("Voice command:", command);
    toast.success(`Sprachbefehl erkannt: ${command}`);
  };

  // Command Handler
  const handleCommand = (command: string) => {
    if (command.startsWith('selectPraesidium:')) {
      const praesidiumId = command.split(':')[1];
      togglePraesidiumWithReviere(praesidiumId);
    } else if (command === 'selectAllStuttgart') {
      const stuttgartPraesidien = praesidiumWithReviere.filter(p => 
        p.city.toLowerCase().includes('stuttgart')
      );
      const allIds = stuttgartPraesidien.flatMap(p => [
        p.id, 
        ...p.reviere.map(r => r.id)
      ]);
      setSelectedStations([...new Set([...selectedStations, ...allIds])]);
    }
    setShowCommandPalette(false);
  };

  // Weiter zum nächsten Schritt
  const handleContinue = () => {
    console.log('🚀 Continue-Button geklickt');
    console.log('📊 selectedStations:', selectedStations);
    console.log('📊 selectedCustomAddresses:', selectedCustomAddresses);
    
    const totalSelected = selectedStations.length + selectedCustomAddresses.length;
    console.log('📊 Total selected:', totalSelected);
    
    if (totalSelected === 0) {
      console.log('❌ Keine Ziele ausgewählt');
      toast.error('Bitte wählen Sie mindestens ein Ziel aus');
      announceToScreenReader('Fehler: Keine Ziele ausgewählt');
      return;
    }
    
    console.log('✅ Weiterleitung zu Step 3');
    toast.success(`${totalSelected} Ziele ausgewählt`);
    announceToScreenReader(`${totalSelected} Ziele ausgewählt - Weiter zur Routenberechnung`);
    setWizardStep(3);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K: Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      
      // Command/Ctrl + /: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Command/Ctrl + 1-4: Switch views
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const views: ('grid' | 'list' | 'compact' | 'map')[] = ['grid', 'list', 'compact', 'map'];
        setActiveView(views[parseInt(e.key) - 1]);
        announceToScreenReader(`${views[parseInt(e.key) - 1]} Ansicht aktiviert`);
      }
      
      // Command/Ctrl + A: Select all visible
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && activeTab === 'stations') {
        e.preventDefault();
        const allIds = praesidiumWithReviere.flatMap(p => [p.id, ...p.reviere.map(r => r.id)]);
        setSelectedStations([...new Set([...selectedStations, ...allIds])]);
        toast.success(`${allIds.length} Stationen ausgewählt`);
      }
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        setShowAddForm(false);
        setShowCommandPalette(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedStations, praesidiumWithReviere]);

  const tabs = [
    {
      id: 'stations',
      label: 'Polizeistationen',
      icon: Building,
      count: selectedStations.length
    },
    {
      id: 'custom',
      label: 'Eigene Adressen',
      icon: MapPin,
      count: selectedCustomAddresses.length
    }
  ];

  const totalSelected = selectedStations.length + selectedCustomAddresses.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header mit Such- und Ansichts-Optionen */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative flex-1 max-w-xl">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Switcher */}
          <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />
          
          {/* Voice Command Button */}
          <button
            onClick={() => handleVoiceCommand('test')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="Sprachsteuerung"
          >
            <Mic className="h-5 w-5" />
            <span className="hidden sm:inline">Sprachsteuerung</span>
          </button>
          
          {/* Command Palette Button */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Befehle (⌘ + K)"
          >
            <Command className="h-5 w-5" />
            <span className="hidden sm:inline">Befehle</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8"
      >
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'stations' | 'custom')}
                className={`flex-1 flex items-center justify-center space-x-3 py-6 px-4 font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'stations' && (
              <motion.div
                key="stations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* View Content */}
                <AnimatePresence mode="wait">
                  {activeView === 'grid' && (
                    <motion.div
                      key="grid"
                      variants={animationVariants.container}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {praesidiumWithReviere
                        .filter(p => 
                          searchQuery === '' || 
                          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.reviere.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((praesidium) => (
                          <PraesidiumCard
                            key={praesidium.id}
                            praesidium={praesidium}
                            onToggle={togglePraesidiumWithReviere}
                            onExpand={() => togglePraesidiumExpansion(praesidium.id)}
                            onStationToggle={handleStationToggle}
                            selectedStations={selectedStations}
                            viewMode="grid"
                            expandedPraesidien={expandedPraesidien}
                          />
                        ))}
                    </motion.div>
                  )}
                  
                  {activeView === 'list' && (
                    <motion.div
                      key="list"
                      variants={animationVariants.container}
                      initial="hidden"
                      animate="show"
                      className="space-y-4"
                    >
                      {praesidiumWithReviere
                        .filter(p => 
                          searchQuery === '' || 
                          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.reviere.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((praesidium) => (
                          <motion.div
                            key={praesidium.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                          >
                            <PraesidiumCard
                              praesidium={praesidium}
                              onToggle={togglePraesidiumWithReviere}
                              onExpand={() => togglePraesidiumExpansion(praesidium.id)}
                              onStationToggle={handleStationToggle}
                              selectedStations={selectedStations}
                              viewMode="list"
                              expandedPraesidien={expandedPraesidien}
                            />
                          </motion.div>
                        ))}
                    </motion.div>
                  )}
                  
                  {activeView === 'compact' && (
                    <motion.div
                      key="compact"
                      variants={animationVariants.container}
                      initial="hidden"
                      animate="show"
                      className="space-y-2"
                    >
                      {praesidiumWithReviere
                        .filter(p => 
                          searchQuery === '' || 
                          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.reviere.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((praesidium) => (
                          <motion.div
                            key={praesidium.id}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              praesidium.selectedCount > 0
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => togglePraesidiumWithReviere(praesidium.id)}
                            whileHover={{ x: 4 }}
                            role="button"
                            tabIndex={0}
                            aria-pressed={praesidium.selectedCount > 0}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Building className="h-5 w-5 text-blue-600" />
                                <div>
                                  <span className="font-medium text-gray-900 dark:text-white">{praesidium.name}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({praesidium.city})</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{praesidium.reviere.length} Reviere</span>
                                {praesidium.selectedCount > 0 && (
                                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                    {praesidium.selectedCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </motion.div>
                  )}

                  {activeView === 'map' && (
                    <div className="py-4">
                      <InteractiveMap
                        routeResults={routes}
                        startAddress="Stuttgart, Schlossplatz"
                        startCoordinates={{ lat: 48.7784, lng: 9.1806 }}
                        onMarkerClick={(route) => {
                          // Marker-Auswahl-Logik: toggle Präsidium oder Revier
                          const id = route.id;
                          if (selectedStations.includes(id)) {
                            setSelectedStations(selectedStations.filter(sid => sid !== id));
                          } else {
                            setSelectedStations([...selectedStations, id]);
                          }
                        }}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'custom' && (
              <motion.div
                key="custom"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Add Address Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Eigene Adressen verwalten
                  </h3>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Neue Adresse</span>
                  </button>
                </div>

                {/* Add Form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
                    >
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Neue Adresse hinzufügen
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name/Bezeichnung
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="z.B. Büro, Zuhause"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Straße
                          </label>
                          <input
                            type="text"
                            value={formData.street}
                            onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                            placeholder="z.B. Musterstraße 123"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            PLZ
                          </label>
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                            placeholder="z.B. 70173"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Stadt
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="z.B. Stuttgart"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={handleAddAddress}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Hinzufügen
                        </button>
                        <button
                          onClick={() => {
                            setShowAddForm(false);
                            setFormData({ name: '', street: '', zipCode: '', city: '' });
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Custom Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customAddresses.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Noch keine eigenen Adressen vorhanden.</p>
                      <p className="text-sm">Fügen Sie Ihre erste Adresse hinzu!</p>
                    </div>
                  ) : (
                    customAddresses
                      .filter(addr => 
                        searchQuery === '' || 
                        addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        addr.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        addr.street.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((address) => (
                        <motion.div
                          key={address.id}
                          className={`address-card p-6 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg ${
                            selectedCustomAddresses.includes(address.id) 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md' 
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                          onClick={() => handleCustomToggle(address.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-6 w-6 text-green-600" />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {address.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {address.street}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {address.zipCode} {address.city}
                                </p>
                              </div>
                            </div>
                            <CheckCircle2 className={`h-6 w-6 transition-colors ${
                              selectedCustomAddresses.includes(address.id) 
                                ? 'text-green-500' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`} />
                          </div>
                        </motion.div>
                      ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating Action Panel */}
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: isPanelOpen ? 0 : 240 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 240 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-t-3xl shadow-2xl z-50 border-t border-gray-200 dark:border-gray-700"
      >
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 cursor-grab active:cursor-grabbing" />
        
        {/* Quick Stats */}
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            ) : (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalSelected}
              </div>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Routen werden berechnet...' : 'Ziele ausgewählt'}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {isPanelOpen ? 'Verstecken' : 'Details'}
            </button>
          </div>
        </div>
        
        {/* Expandable Selection Preview */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div 
              className="px-6 pb-6 max-h-96 overflow-y-auto"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                Ausgewählte Ziele:
              </h3>
              <div className="space-y-2">
                {selectedStations.map(id => {
                  const station = stations.find(s => s.id === id);
                  return station ? (
                    <div key={id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white">{station.name}</span>
                      <button 
                        onClick={() => handleStationToggle(id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null;
                })}
                {selectedCustomAddresses.map(id => {
                  const address = customAddresses.find(a => a.id === id);
                  return address ? (
                    <div key={id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white">{address.name}</span>
                      <button 
                        onClick={() => handleCustomToggle(id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Moderne Navigation */}
      <ModernNavigation totalSelected={totalSelected} onContinue={handleContinue} />

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <CommandDialog 
            isOpen={showCommandPalette} 
            onClose={() => setShowCommandPalette(false)}
            onCommand={handleCommand}
            praesidien={praesidiumWithReviere}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Command Dialog Komponente
interface CommandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
  praesidien: any[];
}

const CommandDialog: React.FC<CommandDialogProps> = ({ isOpen, onClose, onCommand, praesidien }) => {
  const [search, setSearch] = useState('');
  
  // Keyboard shortcut: Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredCommands = praesidien.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b dark:border-gray-700 p-4">
          <input
            type="text"
            placeholder="Suche Befehle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
            autoFocus
          />
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-2 py-1">Schnellaktionen</div>
            <div className="space-y-1">
              <CommandItem 
                icon={<MapPin className="h-4 w-4" />}
                label="Alle in Stuttgart auswählen"
                onSelect={() => onCommand('selectAllStuttgart')}
              />
            </div>
            
            <div className="text-xs text-gray-500 px-2 py-1 mt-4">Präsidien</div>
            <div className="space-y-1">
              {filteredCommands.map(cmd => (
                <CommandItem
                  key={cmd.id}
                  icon={<Building className="h-4 w-4" />}
                  label={`${cmd.name} (${cmd.city})`}
                  onSelect={() => onCommand(`selectPraesidium:${cmd.id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Command Item Komponente
interface CommandItemProps {
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}

const CommandItem: React.FC<CommandItemProps> = ({ icon, label, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className="flex items-center w-full px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
    >
      {icon}
      <span className="ml-2 flex-1 text-left">{label}</span>
      <kbd className="text-xs text-gray-400">⌘{label.charAt(0).toUpperCase()}</kbd>
    </button>
  );
};

export default UltraModernStep2;