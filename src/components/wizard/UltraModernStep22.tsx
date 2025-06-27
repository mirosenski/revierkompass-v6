// ============================================
// ULTRA MODERN STEP 2 - EXPERT UI/UX EDITION
// ============================================
// Vollständig barrierefreie, moderne Komponente mit neuesten UI/UX Trends
// Entwickelt nach WCAG 2.1 AAA Standards

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Building, MapPin, ChevronDown, Plus, CheckCircle2, Trash2,
  List, Grid3X3, Map as MapIcon, X, Search, ArrowRight,
  Keyboard, Eye, EyeOff, Filter, Download, Share2,
  Zap, Command, ChevronUp, Info, Check, AlertCircle,
  Loader2, BarChart3, Hash, Navigation, Layers
} from 'lucide-react';
import { useStationStore } from '@/store/useStationStore';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';
import toast from 'react-hot-toast';
import { useVirtualizer } from '@tanstack/react-virtual';

// ============================================
// CUSTOM HOOKS SECTION
// ============================================
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

// ============================================
// TYPES & INTERFACES SECTION
// ============================================
interface Station {
  id: string;
  name: string;
  city: string;
  type: string;
  coordinates?: [number, number];
}

interface PraesidiumWithDetails extends Station {
  reviere: Station[];
  isExpanded: boolean;
  selectedCount: number;
  distance?: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface CustomAddress {
  id: string;
  name: string;
  street: string;
  zipCode: string;
  city: string;
  coordinates?: Coordinates;
}

type ViewMode = 'grid' | 'list' | 'map' | 'compact';
type TabType = 'stations' | 'custom';
type SortBy = 'name' | 'city' | 'distance' | 'selected';
type FilterType = 'all' | 'selected' | 'unselected' | 'partial';

// ============================================
// ANIMATION VARIANTS SECTION
// ============================================
const animationVariants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  },
  card: {
    rest: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    },
    tap: { scale: 0.98 }
  },
  slideIn: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  },
  fadeScale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  }
};

// ============================================
// ENHANCED ERROR BOUNDARY COMPONENT
// ============================================
class EnhancedErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("UI Component Error:", error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-[400px]" role="alert">
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl max-w-md">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ein Fehler ist aufgetreten
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {this.state.error?.message || 'Unbekannter Fehler'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Seite neu laden"
            >
              Neu laden
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================
// SKIP NAVIGATION COMPONENT (A11Y)
// ============================================
const SkipNavigation: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
               bg-blue-600 text-white px-4 py-2 rounded-lg z-[100] focus:outline-none 
               focus:ring-2 focus:ring-blue-500"
  >
    Zum Hauptinhalt springen
  </a>
);

// ============================================
// LOADING SKELETON COMPONENT
// ============================================
const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Lädt...">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    ))}
    <span className="sr-only">Lade Stationen...</span>
  </div>
);

// ============================================
// KEYBOARD SHORTCUTS MODAL
// ============================================
const KeyboardShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Befehlspalette öffnen' },
    { keys: ['⌘', '/'], description: 'Suche fokussieren' },
    { keys: ['⌘', '1-4'], description: 'Ansicht wechseln' },
    { keys: ['Tab'], description: 'Zum nächsten Element' },
    { keys: ['Shift', 'Tab'], description: 'Zum vorherigen Element' },
    { keys: ['Enter', 'Space'], description: 'Element auswählen' },
    { keys: ['Esc'], description: 'Dialog schließen' },
    { keys: ['⌘', 'A'], description: 'Alle auswählen' },
    { keys: ['⌘', 'D'], description: 'Auswahl aufheben' },
    { keys: ['↑', '↓'], description: 'Durch Listen navigieren' },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="shortcuts-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Tastaturkürzel
        </h2>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <React.Fragment key={i}>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                      {key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && <span className="text-gray-500">+</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Schließen
        </button>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const UltraModernStep2: React.FC = () => {
  // ==========================================
  // STATE MANAGEMENT SECTION
  // ==========================================
  const [activeView, setActiveView] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabType>('stations');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedPraesidien, setExpandedPraesidien] = useState<Set<string>>(new Set());
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    zipCode: '',
    city: ''
  });

  // Refs for focus management
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const addFormRef = useRef<HTMLFormElement>(null);

  // Custom hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  // Focus trap for modals - temporarily disabled
  // const focusTrapRef = useFocusTrap(showAddForm);

  // ==========================================
  // STORE HOOKS SECTION
  // ==========================================
  const { stations, getStationsByType, getReviereByPraesidium, loadStations } = useStationStore();
  const { selectedStations, setSelectedStations, selectedCustomAddresses, setSelectedCustomAddresses } = useWizardStore();
  const { customAddresses, addCustomAddress, deleteCustomAddress, setWizardStep } = useAppStore();

  // ==========================================
  // INITIALIZATION & EFFECTS SECTION
  // ==========================================
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setIsLoading(true);
        await loadStations();
        
        // Announce to screen readers
        const announcement = `${stations.length} Stationen geladen`;
        announceToScreenReader(announcement);
      } catch (error) {
        console.error('Failed to load stations:', error);
        toast.error('Fehler beim Laden der Stationen');
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, [loadStations]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K: Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      
      // Command/Ctrl + /: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Command/Ctrl + 1-4: Switch views
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const views: ViewMode[] = ['grid', 'list', 'map', 'compact'];
        setActiveView(views[parseInt(e.key) - 1]);
      }
      
      // Command/Ctrl + A: Select all visible
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && activeTab === 'stations') {
        e.preventDefault();
        selectAllVisible();
      }
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        setShowAddForm(false);
        setShowKeyboardShortcuts(false);
        setShowQuickPreview(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // ==========================================
  // MEMOIZED DATA SECTION
  // ==========================================
  const praesidien = useMemo(() => getStationsByType('praesidium'), [getStationsByType]);
  
  const praesidiumWithReviere = useMemo(() => 
    praesidien.map(praesidium => ({
      ...praesidium,
      reviere: getReviereByPraesidium(praesidium.id),
      isExpanded: expandedPraesidien.has(praesidium.id),
      selectedCount: getReviereByPraesidium(praesidium.id)
        .filter(r => selectedStations.includes(r.id)).length
    })), 
  [praesidien, getReviereByPraesidium, expandedPraesidien, selectedStations]);

  // Filtered and sorted data
  const filteredAndSortedPraesidien = useMemo(() => {
    let filtered = praesidiumWithReviere;

    // Apply search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        p.reviere.some(r => r.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      );
    }

    // Apply selection filter
    switch (filterType) {
      case 'selected':
        filtered = filtered.filter(p => p.selectedCount > 0);
        break;
      case 'unselected':
        filtered = filtered.filter(p => p.selectedCount === 0);
        break;
      case 'partial':
        filtered = filtered.filter(p => p.selectedCount > 0 && p.selectedCount < p.reviere.length);
        break;
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'city':
          return a.city.localeCompare(b.city);
        case 'selected':
          return b.selectedCount - a.selectedCount;
        case 'distance':
          return 0;
        default:
          return 0;
      }
    });
  }, [praesidiumWithReviere, debouncedSearchQuery, filterType, sortBy]);

  // ==========================================
  // UTILITY FUNCTIONS SECTION
  // ==========================================
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const selectAllVisible = useCallback(() => {
    const allIds = filteredAndSortedPraesidien.flatMap(p => [p.id, ...p.reviere.map(r => r.id)]);
    const newSelection = [...new Set([...selectedStations, ...allIds])];
    setSelectedStations(newSelection);
    toast.success(`${allIds.length} Stationen ausgewählt`);
  }, [filteredAndSortedPraesidien, selectedStations, setSelectedStations]);

  // ==========================================
  // EVENT HANDLERS SECTION
  // ==========================================
  const togglePraesidiumWithReviere = useCallback((praesidiumId: string, event?: React.MouseEvent | React.KeyboardEvent) => {
    const praesidium = praesidiumWithReviere.find(p => p.id === praesidiumId);
    if (!praesidium) return;

    const reviereIds = praesidium.reviere.map(r => r.id);
    const allIds = [praesidiumId, ...reviereIds];
    const allSelected = allIds.every(id => selectedStations.includes(id));

    // Handle multi-select with Ctrl/Cmd
    if (event?.ctrlKey || event?.metaKey) {
      const newSelection = allSelected 
        ? selectedStations.filter(id => !allIds.includes(id))
        : [...new Set([...selectedStations, ...allIds])];
      setSelectedStations(newSelection);
    } else {
      const newSelection = allSelected 
        ? selectedStations.filter(id => !allIds.includes(id))
        : [...new Set([...selectedStations, ...allIds])];
      setSelectedStations(newSelection);
    }

    // Announce change
    const action = allSelected ? 'abgewählt' : 'ausgewählt';
    announceToScreenReader(`${praesidium.name} und ${reviereIds.length} Reviere ${action}`);
  }, [praesidiumWithReviere, selectedStations, setSelectedStations]);

  const handleAddAddress = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = [];
    if (!formData.name.trim()) errors.push('Name');
    if (!formData.street.trim()) errors.push('Straße');
    if (!formData.zipCode.trim()) errors.push('PLZ');
    if (!formData.city.trim()) errors.push('Stadt');
    
    if (errors.length > 0) {
      toast.error(`Bitte füllen Sie folgende Felder aus: ${errors.join(', ')}`);
      return;
    }

    addCustomAddress(formData);
    setFormData({ name: '', street: '', zipCode: '', city: '' });
    setShowAddForm(false);
    toast.success('Adresse erfolgreich hinzugefügt');
    announceToScreenReader('Neue Adresse hinzugefügt');
  }, [formData, addCustomAddress]);

  const handleContinue = useCallback(() => {
    const totalSelected = selectedStations.length + selectedCustomAddresses.length;
    
    if (totalSelected === 0) {
      toast.error('Bitte wählen Sie mindestens ein Ziel aus');
      announceToScreenReader('Fehler: Keine Ziele ausgewählt');
      return;
    }
    
    toast.success(`${totalSelected} Ziele ausgewählt - Weiter zur Routenberechnung`);
    setWizardStep(3);
  }, [selectedStations.length, selectedCustomAddresses.length, setWizardStep]);

  // Handler für das Erweitern/Reduzieren eines Präsidiums
  const togglePraesidiumExpansion = useCallback((praesidiumId: string) => {
    setExpandedPraesidien(prev => {
      const newSet = new Set(prev);
      if (newSet.has(praesidiumId)) {
        newSet.delete(praesidiumId);
      } else {
        newSet.add(praesidiumId);
      }
      return newSet;
    });
  }, []);

  // Handler für das Selektieren/Deselektieren einer Station
  const handleStationToggle = useCallback((stationId: string) => {
    setSelectedStations(
      selectedStations.includes(stationId)
        ? selectedStations.filter(id => id !== stationId)
        : [...selectedStations, stationId]
    );
  }, [setSelectedStations, selectedStations]);

  // Handler für das Selektieren/Deselektieren einer Custom-Adresse
  const handleCustomToggle = useCallback((addressId: string) => {
    setSelectedCustomAddresses(
      selectedCustomAddresses.includes(addressId)
        ? selectedCustomAddresses.filter(id => id !== addressId)
        : [...selectedCustomAddresses, addressId]
    );
  }, [setSelectedCustomAddresses, selectedCustomAddresses]);

  // Handler für das Löschen einer Custom-Adresse
  const handleDeleteAddress = useCallback((addressId: string) => {
    deleteCustomAddress(addressId);
    setSelectedCustomAddresses(selectedCustomAddresses.filter(id => id !== addressId));
    toast.success('Adresse gelöscht');
  }, [deleteCustomAddress, setSelectedCustomAddresses, selectedCustomAddresses]);

  // Gesamtanzahl der ausgewählten Ziele
  const totalSelected = selectedStations.length + selectedCustomAddresses.length;

  // Tabs für die Navigation
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

  // ==========================================
  // VIEW COMPONENTS SECTION
  // ==========================================
  
  // Enhanced Grid View with Virtual Scrolling
  const GridView = () => {
    const parentRef = useRef<HTMLDivElement>(null);
    
    const rowVirtualizer = useVirtualizer({
      count: Math.ceil(filteredAndSortedPraesidien.length / 3),
      getScrollElement: () => parentRef.current,
      estimateSize: () => 280,
      overscan: 5,
    });

    return (
      <div 
        ref={parentRef}
        className="h-[600px] overflow-auto"
        role="grid"
        aria-label="Polizeistationen Rasteransicht"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * 3;
            const items = filteredAndSortedPraesidien.slice(startIndex, startIndex + 3);
            
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1"
              >
                {items.map((praesidium) => (
                  <PraesidiumCard 
                    key={praesidium.id} 
                    praesidium={praesidium}
                    onToggle={togglePraesidiumWithReviere}
                    onExpand={() => togglePraesidiumExpansion(praesidium.id)}
                    onStationToggle={handleStationToggle}
                    selectedStations={selectedStations}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // List View Component
  const ListView = () => (
    <div className="space-y-4" role="list" aria-label="Polizeistationen Listenansicht">
      <AnimatePresence>
        {filteredAndSortedPraesidien.map((praesidium) => (
          <motion.div
            key={praesidium.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <PraesidiumListItem
              praesidium={praesidium}
              onToggle={togglePraesidiumWithReviere}
              onStationToggle={handleStationToggle}
              selectedStations={selectedStations}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  // Map View Component (Enhanced)
  const MapView = () => (
    <div className="relative h-[600px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Interaktive Kartenansicht
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Wählen Sie Stationen direkt auf der Karte aus
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Karte aktivieren
          </button>
        </div>
      </div>
    </div>
  );

  // Compact View Component
  const CompactView = () => (
    <div className="space-y-2" role="list" aria-label="Kompakte Ansicht">
      {filteredAndSortedPraesidien.map((praesidium) => (
        <motion.div
          key={praesidium.id}
          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
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
                <span className="font-medium">{praesidium.name}</span>
                <span className="text-sm text-gray-500 ml-2">({praesidium.city})</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{praesidium.reviere.length} Reviere</span>
              {praesidium.selectedCount > 0 && (
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  {praesidium.selectedCount}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // ==========================================
  // RENDER SECTION
  // ==========================================
  return (
    <EnhancedErrorBoundary>
      <SkipNavigation />
      
      <div 
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
        role="main"
        aria-label="Ziele auswählen für Routenberechnung"
        id="main-content"
        ref={mainContentRef}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          {/* ======================================
              HEADER SECTION
              ====================================== */}
          <header className="py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Ziele auswählen
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  Wählen Sie Polizeistationen und eigene Adressen für die Routenberechnung
                </p>
              </div>
              
              {/* Quick Stats with Animation */}
              <motion.div 
                className="flex items-center space-x-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center">
                  <motion.p 
                    className="text-3xl font-bold text-blue-600"
                    key={selectedStations.length}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {selectedStations.length}
                  </motion.p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stationen</p>
                </div>
                <div className="h-12 w-px bg-gray-300 dark:bg-gray-700" />
                <div className="text-center">
                  <motion.p 
                    className="text-3xl font-bold text-green-600"
                    key={selectedCustomAddresses.length}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {selectedCustomAddresses.length}
                  </motion.p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Adressen</p>
                </div>
              </motion.div>
            </div>

            {/* ======================================
                SEARCH & FILTER BAR
                ====================================== */}
            <div className="space-y-4">
              {/* Search Input with Voice Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Suche nach Präsidien, Revieren oder Städten..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 
                           dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-all text-gray-900 dark:text-white 
                           placeholder-gray-500 text-lg"
                  aria-label="Suche nach Stationen und Adressen"
                  aria-describedby="search-help"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Sprachsuche starten"
                  >
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <kbd className="hidden sm:inline-flex px-2 py-1 text-xs text-gray-500 bg-gray-100 
                                 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                    ⌘/
                  </kbd>
                </div>
              </div>
              <p id="search-help" className="sr-only">
                Geben Sie Suchbegriffe ein oder nutzen Sie die Sprachsuche
              </p>

              {/* Filter and View Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* View Mode Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ansicht:</span>
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm" 
                       role="group" 
                       aria-label="Ansichtsmodus wählen">
                    {[
                      { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Raster', shortcut: '1' },
                      { mode: 'list' as ViewMode, icon: List, label: 'Liste', shortcut: '2' },
                      { mode: 'map' as ViewMode, icon: MapIcon, label: 'Karte', shortcut: '3' },
                      { mode: 'compact' as ViewMode, icon: Layers, label: 'Kompakt', shortcut: '4' }
                    ].map(({ mode, icon: Icon, label, shortcut }) => (
                      <button
                        key={mode}
                        onClick={() => setActiveView(mode)}
                        className={`relative px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                          activeView === mode
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-pressed={activeView === mode}
                        aria-label={`${label}-Ansicht (⌘${shortcut})`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{label}</span>
                        {activeView === mode && (
                          <motion.div
                            layoutId="activeViewIndicator"
                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort and Filter Controls */}
                <div className="flex items-center space-x-4">
                  {/* Sort Dropdown */}
                  <div className="flex items-center space-x-2">
                    <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sortierung:
                    </label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                               rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="name">Name</option>
                      <option value="city">Stadt</option>
                      <option value="selected">Ausgewählt</option>
                      <option value="distance">Entfernung</option>
                    </select>
                  </div>

                  {/* Filter Dropdown */}
                  <div className="flex items-center space-x-2">
                    <label htmlFor="filter-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Filter:
                    </label>
                    <select
                      id="filter-select"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as FilterType)}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                               rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Alle</option>
                      <option value="selected">Ausgewählt</option>
                      <option value="unselected">Nicht ausgewählt</option>
                      <option value="partial">Teilweise</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowKeyboardShortcuts(true)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                               dark:hover:bg-gray-600 transition-colors"
                      aria-label="Tastaturkürzel anzeigen (⌘K)"
                    >
                      <Keyboard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => setShowQuickPreview(!showQuickPreview)}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                        showQuickPreview
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                      }`}
                      aria-pressed={showQuickPreview}
                      aria-label="Schnellvorschau umschalten"
                    >
                      {showQuickPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="hidden sm:inline">Vorschau</span>
                      {totalSelected > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          {totalSelected}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* ======================================
              TAB NAVIGATION
              ====================================== */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="flex border-b border-gray-200 dark:border-gray-700" 
                 role="tablist" 
                 aria-label="Ziel-Kategorien">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 flex items-center justify-center space-x-3 py-6 px-4 font-medium 
                              transition-all duration-200 relative ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <motion.span 
                        key={tab.count}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tab.count}
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ======================================
                TAB CONTENT
                ====================================== */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'stations' && (
                  <motion.div
                    key="stations"
                    variants={animationVariants.slideIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    role="tabpanel"
                    id="panel-stations"
                    aria-label="Polizeistationen"
                  >
                    {isLoading ? (
                      <LoadingSkeleton />
                    ) : (
                      <>
                        {/* Results Summary */}
                        <div className="mb-6 flex items-center justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredAndSortedPraesidien.length} von {praesidiumWithReviere.length} Präsidien
                          </p>
                          <button
                            onClick={selectAllVisible}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Alle sichtbaren auswählen
                          </button>
                        </div>

                        {/* View Content */}
                        {activeView === 'grid' && <GridView />}
                        {activeView === 'list' && <ListView />}
                        {activeView === 'map' && <MapView />}
                        {activeView === 'compact' && <CompactView />}
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === 'custom' && (
                  <motion.div
                    key="custom"
                    variants={animationVariants.slideIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-6"
                    role="tabpanel"
                    id="panel-custom"
                    aria-label="Eigene Adressen"
                  >
                    {/* Custom Addresses Header */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Eigene Adressen verwalten
                      </h3>
                      <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 
                                 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white 
                                 rounded-lg transition-all shadow-md hover:shadow-lg"
                        aria-expanded={showAddForm}
                        aria-controls="add-address-form"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Neue Adresse</span>
                      </button>
                    </div>

                    {/* Add Address Form */}
                    <AnimatePresence>
                      {showAddForm && (
                        <motion.form
                          ref={addFormRef}
                          id="add-address-form"
                          variants={animationVariants.fadeScale}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          onSubmit={handleAddAddress}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 
                                   dark:to-gray-800 rounded-xl p-6 shadow-inner"
                          aria-label="Neue Adresse hinzufügen"
                        >
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Neue Adresse hinzufügen
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700 
                                                               dark:text-gray-300 mb-1">
                                Name/Bezeichnung <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="z.B. Büro, Zuhause"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                                aria-required="true"
                              />
                            </div>
                            <div>
                              <label htmlFor="street" className="block text-sm font-medium text-gray-700 
                                                                dark:text-gray-300 mb-1">
                                Straße <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="street"
                                type="text"
                                value={formData.street}
                                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                                placeholder="z.B. Musterstraße 123"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                                aria-required="true"
                              />
                            </div>
                            <div>
                              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 
                                                                 dark:text-gray-300 mb-1">
                                PLZ <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="zipCode"
                                type="text"
                                value={formData.zipCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                                placeholder="z.B. 70173"
                                pattern="[0-9]{5}"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                                aria-required="true"
                              />
                            </div>
                            <div>
                              <label htmlFor="city" className="block text-sm font-medium text-gray-700 
                                                              dark:text-gray-300 mb-1">
                                Stadt <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="city"
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="z.B. Stuttgart"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                                aria-required="true"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-6">
                            <button
                              type="submit"
                              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                                       transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              Hinzufügen
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddForm(false);
                                setFormData({ name: '', street: '', zipCode: '', city: '' });
                              }}
                              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg 
                                       transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                              Abbrechen
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* Custom Addresses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {customAddresses.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <MapPin className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Noch keine eigenen Adressen vorhanden
                          </p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            Fügen Sie Ihre erste Adresse hinzu!
                          </p>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {customAddresses
                            .filter(addr => 
                              debouncedSearchQuery === '' || 
                              addr.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                              addr.city.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                              addr.street.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
                            )
                            .map((address) => (
                              <CustomAddressCard
                                key={address.id}
                                address={address}
                                isSelected={selectedCustomAddresses.includes(address.id)}
                                onToggle={() => handleCustomToggle(address.id)}
                                onDelete={() => handleDeleteAddress(address.id)}
                              />
                            ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ======================================
              QUICK PREVIEW SIDEBAR
              ====================================== */}
          <AnimatePresence>
            {showQuickPreview && (
              <motion.aside
                variants={animationVariants.slideIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl 
                         z-50 overflow-hidden"
                role="complementary"
                aria-label="Ausgewählte Ziele Vorschau"
              >
                <div className="h-full flex flex-col">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Ausgewählte Ziele
                      </h3>
                      <button
                        onClick={() => setShowQuickPreview(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                                 transition-colors"
                        aria-label="Vorschau schließen"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {totalSelected} Ziele für die Routenberechnung
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {totalSelected === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Noch keine Ziele ausgewählt
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Selected Stations */}
                        {selectedStations.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Polizeistationen ({selectedStations.length})
                            </h4>
                            <div className="space-y-2">
                              {selectedStations.map(id => {
                                const station = stations.find(s => s.id === id);
                                return station ? (
                                  <motion.div
                                    key={id}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-3 bg-blue-50 
                                             dark:bg-blue-900/20 rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <Building className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {station.name}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleStationToggle(id)}
                                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 
                                               text-red-500 hover:text-red-700 transition-colors"
                                      aria-label={`${station.name} entfernen`}
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </motion.div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Selected Custom Addresses */}
                        {selectedCustomAddresses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Eigene Adressen ({selectedCustomAddresses.length})
                            </h4>
                            <div className="space-y-2">
                              {selectedCustomAddresses.map(id => {
                                const address = customAddresses.find(a => a.id === id);
                                return address ? (
                                  <motion.div
                                    key={id}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-3 bg-green-50 
                                             dark:bg-green-900/20 rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <MapPin className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {address.name}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleCustomToggle(id)}
                                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 
                                               text-red-500 hover:text-red-700 transition-colors"
                                      aria-label={`${address.name} entfernen`}
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </motion.div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Export Actions */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                                     dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center 
                                     justify-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Als Excel exportieren</span>
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                                     dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center 
                                     justify-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>Auswahl teilen</span>
                    </button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Keyboard Shortcuts Modal */}
          <KeyboardShortcutsModal 
            isOpen={showKeyboardShortcuts} 
            onClose={() => setShowKeyboardShortcuts(false)} 
          />
        </div>

        {/* ======================================
            MODERN STICKY BOTTOM NAVIGATION
            ====================================== */}
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl 
                   border-t border-gray-200 dark:border-gray-700 z-40"
          role="navigation"
          aria-label="Aktionsleiste"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Progress Indicator */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="relative"
                    animate={{ rotate: totalSelected > 0 ? 360 : 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg ${
                      totalSelected > 0 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {totalSelected}
                    </div>
                    {totalSelected > 0 && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-blue-500 opacity-30"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Ziele ausgewählt
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedStations.length} Stationen • {selectedCustomAddresses.length} Adressen
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="hidden lg:flex items-center space-x-4 pl-6 border-l border-gray-300 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredAndSortedPraesidien.length} Präsidien verfügbar
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stations.length} Stationen gesamt
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="hidden md:flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => {
                      setSelectedStations([]);
                      setSelectedCustomAddresses([]);
                      toast.success('Auswahl zurückgesetzt');
                      announceToScreenReader('Alle Auswahlen wurden zurückgesetzt');
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 
                             dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 
                             rounded-lg transition-all"
                    disabled={totalSelected === 0}
                  >
                    Zurücksetzen
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                  <button
                    onClick={selectAllVisible}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 
                             dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 
                             rounded-lg transition-all"
                  >
                    Alle sichtbaren
                  </button>
                </div>
              </div>

              {/* Continue Button with Animation */}
              <motion.button
                whileHover={{ scale: totalSelected > 0 ? 1.02 : 1 }}
                whileTap={{ scale: totalSelected > 0 ? 0.98 : 1 }}
                onClick={handleContinue}
                disabled={totalSelected === 0}
                className={`relative px-8 py-3 rounded-xl font-medium transition-all flex items-center 
                         space-x-2 shadow-lg overflow-hidden group ${
                  totalSelected > 0
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                aria-label={`Routenberechnung starten (${totalSelected} Ziele ausgewählt)`}
              >
                {/* Animated Background */}
                {totalSelected > 0 && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{ opacity: 0.3 }}
                  />
                )}
                <span className="relative">Routenberechnung starten</span>
                <ArrowRight className={`h-5 w-5 relative transition-transform ${
                  totalSelected > 0 ? 'group-hover:translate-x-1' : ''
                }`} />
                {totalSelected > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs"
                  >
                    {totalSelected}
                  </motion.span>
                )}
              </motion.button>
            </div>

            {/* Mobile Summary (hidden on desktop) */}
            <div className="mt-4 flex md:hidden items-center justify-between text-sm">
              <button
                onClick={() => setShowQuickPreview(true)}
                className="text-blue-600 dark:text-blue-400 font-medium"
              >
                Auswahl anzeigen ({totalSelected})
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setSelectedStations([]);
                    setSelectedCustomAddresses([]);
                  }}
                  className="text-gray-600 dark:text-gray-400"
                  disabled={totalSelected === 0}
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          </div>
        </motion.nav>
      </div>
    </EnhancedErrorBoundary>
  );
};

// ============================================
// COMPONENT LIBRARY SECTION
// ============================================

// Praesidium Card Component
interface PraesidiumCardProps {
  praesidium: PraesidiumWithDetails;
  onToggle: (id: string, event?: React.MouseEvent | React.KeyboardEvent) => void;
  onExpand: () => void;
  onStationToggle: (id: string) => void;
  selectedStations: string[];
}

const PraesidiumCard: React.FC<PraesidiumCardProps> = ({ 
  praesidium, 
  onToggle, 
  onExpand, 
  onStationToggle, 
  selectedStations 
}) => {
  const isFullySelected = [praesidium.id, ...praesidium.reviere.map(r => r.id)]
    .every(id => selectedStations.includes(id));
  const isPartiallySelected = praesidium.selectedCount > 0 && !isFullySelected;

  return (
    <motion.article
      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
        isFullySelected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg'
          : isPartiallySelected
          ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 hover:shadow-md'
      }`}
      role="gridcell"
    >
      {/* Selection Badge */}
      <AnimatePresence>
        {(isFullySelected || isPartiallySelected) && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 
                     rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10"
          >
            {isFullySelected ? <Check className="h-5 w-5" /> : praesidium.selectedCount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Header */}
      <div
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-expanded={praesidium.isExpanded}
        aria-label={`${praesidium.name}, ${praesidium.city}, ${praesidium.reviere.length} Reviere. ${
          isFullySelected ? 'Vollständig ausgewählt' : 
          isPartiallySelected ? `${praesidium.selectedCount} Reviere ausgewählt` : 
          'Nicht ausgewählt'
        }`}
        onClick={(e) => onToggle(praesidium.id, e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(praesidium.id, e);
          }
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl transition-colors ${
              isFullySelected || isPartiallySelected
                ? 'bg-blue-200 dark:bg-blue-800/50'
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {praesidium.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{praesidium.city}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {praesidium.reviere.length} Reviere
          </span>
          {praesidium.distance && (
            <span className="text-sm text-gray-500 dark:text-gray-500 flex items-center space-x-1">
              <Navigation className="h-3 w-3" />
              <span>{praesidium.distance} km</span>
            </span>
          )}
        </div>
      </div>

      {/* Expand Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                 transition-all group"
        aria-label={`${praesidium.isExpanded ? 'Reviere ausblenden' : 'Reviere anzeigen'} für ${praesidium.name}`}
      >
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform group-hover:text-gray-600 
                    dark:group-hover:text-gray-300 ${
            praesidium.isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expandable Reviere List */}
      <AnimatePresence>
        {praesidium.isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2"
            role="region"
            aria-label={`Reviere von ${praesidium.name}`}
          >
            {praesidium.reviere.map((revier, index) => (
              <motion.div
                key={revier.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer 
                         transition-all group ${
                  selectedStations.includes(revier.id)
                    ? 'bg-blue-100 dark:bg-blue-800/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStationToggle(revier.id);
                }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedStations.includes(revier.id)}
                aria-label={`${revier.name} ${selectedStations.includes(revier.id) ? 'ausgewählt' : 'nicht ausgewählt'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onStationToggle(revier.id);
                  }
                }}
              >
                <span className="text-sm font-medium flex-1">{revier.name}</span>
                <CheckCircle2
                  className={`h-5 w-5 transition-all ${
                    selectedStations.includes(revier.id)
                      ? 'text-blue-500 scale-110'
                      : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'
                  }`}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

// Praesidium List Item Component
interface PraesidiumListItemProps {
  praesidium: PraesidiumWithDetails;
  onToggle: (id: string, event?: React.MouseEvent | React.KeyboardEvent) => void;
  onStationToggle: (id: string) => void;
  selectedStations: string[];
}

const PraesidiumListItem: React.FC<PraesidiumListItemProps> = ({ 
  praesidium, 
  onToggle, 
  onStationToggle, 
  selectedStations 
}) => {
  const isFullySelected = [praesidium.id, ...praesidium.reviere.map(r => r.id)]
    .every(id => selectedStations.includes(id));

  return (
    <div className="p-6">
      <div
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 -m-2 
                 transition-colors"
        role="button"
        tabIndex={0}
        onClick={(e) => onToggle(praesidium.id, e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(praesidium.id, e);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${
              isFullySelected 
                ? 'bg-blue-200 dark:bg-blue-800/50' 
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {praesidium.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{praesidium.city}</span>
                <span className="text-gray-400">•</span>
                <span>{praesidium.reviere.length} Reviere</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {praesidium.selectedCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 
                         dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {praesidium.selectedCount} ausgewählt
              </motion.span>
            )}
            <CheckCircle2
              className={`h-6 w-6 transition-all ${
                isFullySelected
                  ? 'text-blue-500 scale-110'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Reviere Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {praesidium.reviere.map((revier) => (
          <motion.button
            key={revier.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg flex items-center justify-between transition-all ${
              selectedStations.includes(revier.id)
                ? 'bg-blue-100 dark:bg-blue-800/30 border-2 border-blue-500'
                : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onStationToggle(revier.id);
            }}
            aria-pressed={selectedStations.includes(revier.id)}
            aria-label={`${revier.name} ${selectedStations.includes(revier.id) ? 'ausgewählt' : 'nicht ausgewählt'}`}
          >
            <span className="text-sm font-medium">{revier.name}</span>
            <CheckCircle2
              className={`h-4 w-4 ml-2 flex-shrink-0 transition-all ${
                selectedStations.includes(revier.id)
                  ? 'text-blue-500'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Custom Address Card Component
interface CustomAddressCardProps {
  address: CustomAddress;
  isSelected: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

const CustomAddressCard: React.FC<CustomAddressCardProps> = ({ 
  address, 
  isSelected, 
  onToggle, 
  onDelete 
}) => {
  return (
    <motion.article
      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${address.name}, ${address.street}, ${address.zipCode} ${address.city}. ${
        isSelected ? 'Ausgewählt' : 'Nicht ausgewählt'
      }`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 
                     rounded-full flex items-center justify-center text-white shadow-lg z-10"
          >
            <Check className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`p-3 rounded-xl transition-colors ${
            isSelected
              ? 'bg-green-200 dark:bg-green-800/50'
              : 'bg-green-100 dark:bg-green-900/30'
          }`}>
            <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 
                   hover:text-red-700 transition-colors ml-2"
          aria-label={`${address.name} löschen`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
};

// Export default component
export default UltraModernStep2;

// Export additional components for testing
export { PraesidiumCard, CustomAddressCard, KeyboardShortcutsModal };