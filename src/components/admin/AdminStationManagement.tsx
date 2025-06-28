import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Search, Filter, MapPin, Phone, Mail, Clock, Building2, X, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAdminStore } from '@/store/useAdminStore'
import { Station, StationType } from '@/types/station.types'

// ===== TYPES =====
interface StationCardProps {
  station: Station;
  onEdit: (station: Station) => void;
  onDelete: (id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

interface StationModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: StationFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  availablePraesidien: Station[];
}

interface StationFormData {
  name: string;
  address: string;
  city: string;
  telefon: string;
  email: string;
  coordinates: [number, number];
  type: StationType;
  notdienst24h: boolean;
  isActive: boolean;
  parentId: string;
}

interface FilterState {
  search: string;
  city: string;
  type: 'all' | StationType;
  showInactive: boolean;
}

// ===== CONSTANTS =====
const FORM_VALIDATION_RULES = {
  name: { required: true, minLength: 2 },
  address: { required: true, minLength: 5 },
  city: { required: true, minLength: 2 },
  telefon: { required: true, pattern: /^[\d\s\-\+\(\)]+$/ },
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  coordinates: { required: true, lat: [-90, 90], lng: [-180, 180] }
} as const;

const INITIAL_FORM_DATA: StationFormData = {
  name: '',
  address: '',
  city: '',
  telefon: '',
  email: '',
  coordinates: [0, 0],
  type: 'revier',
  notdienst24h: false,
  isActive: true,
  parentId: '',
};

// ===== HOOKS =====
const useFormValidation = (formData: StationFormData) => {
  return useMemo(() => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name?.trim()) {
      errors.name = 'Name ist erforderlich';
    } else if (formData.name.trim().length < FORM_VALIDATION_RULES.name.minLength) {
      errors.name = `Name muss mindestens ${FORM_VALIDATION_RULES.name.minLength} Zeichen lang sein`;
    }

    // Address validation
    if (!formData.address?.trim()) {
      errors.address = 'Adresse ist erforderlich';
    } else if (formData.address.trim().length < FORM_VALIDATION_RULES.address.minLength) {
      errors.address = `Adresse muss mindestens ${FORM_VALIDATION_RULES.address.minLength} Zeichen lang sein`;
    }

    // City validation
    if (!formData.city?.trim()) {
      errors.city = 'Stadt ist erforderlich';
    } else if (formData.city.trim().length < FORM_VALIDATION_RULES.city.minLength) {
      errors.city = `Stadt muss mindestens ${FORM_VALIDATION_RULES.city.minLength} Zeichen lang sein`;
    }

    // Phone validation
    if (!formData.telefon?.trim()) {
      errors.telefon = 'Telefon ist erforderlich';
    } else if (!FORM_VALIDATION_RULES.telefon.pattern.test(formData.telefon)) {
      errors.telefon = 'Ungültiges Telefonnummer-Format';
    }

    // Email validation (optional)
    if (formData.email?.trim() && !FORM_VALIDATION_RULES.email.pattern.test(formData.email)) {
      errors.email = 'Ungültige E-Mail-Adresse';
    }

    // Coordinates validation
    const [lat, lng] = formData.coordinates;
    if (!lat || !lng) {
      errors.coordinates = 'Koordinaten sind erforderlich';
    } else if (lat < -90 || lat > 90) {
      errors.coordinates = 'Breitengrad muss zwischen -90 und 90 liegen';
    } else if (lng < -180 || lng > 180) {
      errors.coordinates = 'Längengrad muss zwischen -180 und 180 liegen';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }, [formData]);
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ===== COMPONENTS =====
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-12 w-12'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
  );
};

const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = <div className="text-red-500 p-4">Etwas ist schief gelaufen</div> 
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('ErrorBoundary caught an error:', error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

const StationCard: React.FC<StationCardProps> = React.memo(({ 
  station, 
  onEdit, 
  onDelete, 
  isExpanded, 
  onToggle, 
  children 
}) => {
  const isPraesidium = station.type === 'praesidium';
  
  // Sichere ID-Generierung
  const stationId = useMemo(() => {
    if (station.id && typeof station.id === 'string' && station.id !== 'NaN') {
      return station.id;
    }
    return `station-${station.name?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
  }, [station.id, station.name]);

  const handleEdit = useCallback(() => {
    onEdit(station);
  }, [station, onEdit]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Möchten Sie "${station.name}" wirklich löschen?`)) {
      onDelete(stationId);
    }
  }, [station.name, stationId, onDelete]);

  return (
    <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
      isPraesidium 
        ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 shadow-md ml-4 md:ml-8'
    } hover:shadow-xl hover:scale-[1.01] border border-gray-200/50 dark:border-gray-600/50`}>
      
      {/* Status Badges */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {station.notdienst24h && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 shadow-sm">
            <Clock className="w-3 h-3" />
            24h
          </span>
        )}
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
          station.isActive 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
        }`}>
          {station.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {station.isActive ? 'Aktiv' : 'Inaktiv'}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {isPraesidium && (
              <button
                onClick={onToggle}
                className="p-2 hover:bg-white/70 dark:hover:bg-gray-700/70 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label={isExpanded ? 'Reviere ausblenden' : 'Reviere anzeigen'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? 
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                }
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 truncate">
                <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="truncate">{station.name}</span>
              </h3>
              <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-lg text-xs font-medium ${
                isPraesidium 
                  ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-900 dark:text-blue-200'
                  : 'bg-green-200 dark:bg-green-800/50 text-green-900 dark:text-green-200'
              }`}>
                {isPraesidium ? 'Präsidium' : 'Revier'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{station.address}, {station.city}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a 
              href={`tel:${station.telefon}`} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
              title={station.telefon}
            >
              {station.telefon}
            </a>
          </div>
          {station.email && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 md:col-span-2">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a 
                href={`mailto:${station.email}`} 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                title={station.email}
              >
                {station.email}
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label={`${station.name} bearbeiten`}
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Bearbeiten</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={`${station.name} löschen`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {children}
    </div>
  );
});

StationCard.displayName = 'StationCard';

const StationModal: React.FC<StationModalProps> = React.memo(({
  station,
  isOpen,
  onClose,
  onSave,
  isLoading,
  error,
  availablePraesidien
}) => {
  const [formData, setFormData] = useState<StationFormData>(INITIAL_FORM_DATA);
  const { errors, isValid } = useFormValidation(formData);

  // Form zurücksetzen bei Modal-Öffnung/Schließung
  useEffect(() => {
    if (isOpen) {
      if (station) {
        setFormData({
          name: station.name || '',
          address: station.address || '',
          city: station.city || '',
          telefon: station.telefon || '',
          email: station.email || '',
          coordinates: station.coordinates || [0, 0],
          type: station.type || 'revier',
          notdienst24h: station.notdienst24h || false,
          isActive: station.isActive !== false,
          parentId: station.parentId || '',
        });
      } else {
        setFormData(INITIAL_FORM_DATA);
      }
    }
  }, [station, isOpen]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      toast.error('Bitte korrigieren Sie die Eingabefehler');
      return;
    }

    try {
      await onSave(formData);
      toast.success(station ? 'Station erfolgreich aktualisiert' : 'Station erfolgreich erstellt');
    } catch (err) {
      console.error('❌ Fehler beim Speichern:', err);
      toast.error('Fehler beim Speichern der Station');
    }
  }, [formData, isValid, onSave, station]);

  const handleInputChange = useCallback((field: keyof StationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCoordinateChange = useCallback((index: 0 | 1, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      coordinates: [
        index === 0 ? numValue : prev.coordinates[0],
        index === 1 ? numValue : prev.coordinates[1]
      ] as [number, number]
    }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {station ? 'Station bearbeiten' : 'Neue Station erstellen'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Modal schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.name 
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'
                }`}
                placeholder="z.B. Polizeipräsidium Stuttgart"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Typ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Typ *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as StationType)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="revier">Revier</option>
                <option value="praesidium">Präsidium</option>
              </select>
            </div>

            {/* Stadt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stadt *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.city 
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'
                }`}
                placeholder="z.B. Stuttgart"
                aria-describedby={errors.city ? 'city-error' : undefined}
              />
              {errors.city && (
                <p id="city-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.city}
                </p>
              )}
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon *
              </label>
              <input
                type="tel"
                value={formData.telefon}
                onChange={(e) => handleInputChange('telefon', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.telefon 
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'
                }`}
                placeholder="z.B. +49 711 899-0"
                aria-describedby={errors.telefon ? 'telefon-error' : undefined}
              />
              {errors.telefon && (
                <p id="telefon-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.telefon}
                </p>
              )}
            </div>

            {/* Adresse */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.address 
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'
                }`}
                placeholder="z.B. Heslacher Straße 12"
                aria-describedby={errors.address ? 'address-error' : undefined}
              />
              {errors.address && (
                <p id="address-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* E-Mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.email 
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'
                }`}
                placeholder="z.B. info@polizei.bwl.de"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Übergeordnetes Präsidium */}
            {formData.type === 'revier' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Übergeordnetes Präsidium
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => handleInputChange('parentId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Präsidium auswählen...</option>
                  {availablePraesidien.map(praesidium => (
                    <option key={praesidium.id} value={praesidium.id}>
                      {praesidium.name} ({praesidium.city})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Koordinaten */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Koordinaten *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    step="any"
                    value={formData.coordinates[0]}
                    onChange={(e) => handleCoordinateChange(0, e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.coordinates 
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'
                    }`}
                    placeholder="Breitengrad (z.B. 48.7784)"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    value={formData.coordinates[1]}
                    onChange={(e) => handleCoordinateChange(1, e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.coordinates 
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'
                    }`}
                    placeholder="Längengrad (z.B. 9.1806)"
                  />
                </div>
              </div>
              {errors.coordinates && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.coordinates}
                </p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notdienst24h}
                  onChange={(e) => handleInputChange('notdienst24h', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">24h Notdienst</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Station aktiv</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t dark:border-gray-700">
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              <span className="font-medium">
                {station ? 'Aktualisieren' : 'Erstellen'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

StationModal.displayName = 'StationModal';

// ===== MAIN COMPONENT =====
const AdminStationManagement: React.FC = () => {
  const {
    stations,
    isLoading,
    error,
    loadStations,
    createStation,
    deleteStation,
    updateStation,
  } = useAdminStore();

  // State Management
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: '',
    type: 'all',
    showInactive: true
  });

  const [expandedPresidia, setExpandedPresidia] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  // Debounced search for better performance
  const debouncedSearch = useDebounce(filters.search, 300);

  // Load stations on mount and when showInactive changes
  useEffect(() => {
    const loadStationsWithOptions = async () => {
      try {
        await loadStations({ 
          all: filters.showInactive, 
          take: 1000
        });
      } catch (err) {
        console.error('❌ Fehler beim Laden der Stationen:', err);
        toast.error('Fehler beim Laden der Stationen');
      }
    };

    loadStationsWithOptions();
  }, [filters.showInactive, loadStations]);

  // Auto-expand all praesidia when stations load
  useEffect(() => {
    const praesidiumIds = stations
      .filter(s => s.type === 'praesidium')
      .map(s => s.id)
      .filter(Boolean);
    
    setExpandedPresidia(new Set(praesidiumIds));
  }, [stations]);

  // Memoized filtered stations for performance
  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch = [
          station.name,
          station.address,
          station.city,
          station.telefon,
          station.email
        ].some(field => field?.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // City filter
      if (filters.city && station.city !== filters.city) {
        return false;
      }

      // Type filter
      if (filters.type !== 'all' && station.type !== filters.type) {
        return false;
      }

      return true;
    });
  }, [stations, debouncedSearch, filters.city, filters.type]);

  // Memoized data calculations
  const { praesidien, availablePraesidien, allCities } = useMemo(() => {
    const praesidien = filteredStations.filter(s => s.type === 'praesidium');
    const availablePraesidien = stations.filter(s => s.type === 'praesidium' && s.isActive);
    const allCities = Array.from(new Set(stations.map(s => s.city).filter(Boolean))).sort();
    
    return { praesidien, availablePraesidien, allCities };
  }, [filteredStations, stations]);

  // Get reviere for a specific praesidium
  const getReviere = useCallback((praesidiumId: string) => {
    return filteredStations.filter(s => 
      s.type === 'revier' && s.parentId === praesidiumId
    );
  }, [filteredStations]);

  // Event Handlers
  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      city: '',
      type: 'all',
      showInactive: filters.showInactive // Keep showInactive state
    });
  }, [filters.showInactive]);

  const handleCreateStation = useCallback(() => {
    setEditingStation(null);
    setIsModalOpen(true);
  }, []);

  const handleEditStation = useCallback((station: Station) => {
    setEditingStation(station);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingStation(null);
  }, []);

  const handleSaveStation = useCallback(async (formData: StationFormData) => {
    try {
      if (editingStation) {
        await updateStation(editingStation.id, formData);
      } else {
        await createStation(formData as Station);
      }
      
      // Reload stations to get fresh data
      await loadStations({ 
        all: filters.showInactive, 
        take: 1000
      });
      
      handleCloseModal();
    } catch (err) {
      console.error('❌ Fehler beim Speichern:', err);
      throw err; // Re-throw to let modal handle the error display
    }
  }, [editingStation, updateStation, createStation, loadStations, filters.showInactive, handleCloseModal]);

  const handleDeleteStation = useCallback(async (stationId: string) => {
    try {
      await deleteStation(stationId);
      toast.success('Station erfolgreich gelöscht');
      
      // Reload stations
      await loadStations({ 
        all: filters.showInactive, 
        take: 1000
      });
    } catch (err) {
      console.error('❌ Fehler beim Löschen:', err);
      toast.error('Fehler beim Löschen der Station');
    }
  }, [deleteStation, loadStations, filters.showInactive]);

  const togglePraesidiumExpansion = useCallback((praesidiumId: string) => {
    setExpandedPresidia(prev => {
      const newSet = new Set(prev);
      if (newSet.has(praesidiumId)) {
        newSet.delete(praesidiumId);
      } else {
        newSet.add(praesidiumId);
      }
      return newSet;
    });
  }, []);

  // Safe ID generation
  const getSafeId = useCallback((station: Station, index: number) => {
    if (station.id && typeof station.id === 'string' && station.id !== 'NaN') {
      return station.id;
    }
    return `station-${station.name?.replace(/\s+/g, '-').toLowerCase()}-${index}`;
  }, []);

  // Loading State
  if (isLoading && stations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Stationen werden geladen...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && stations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3 w-16 h-16 mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Fehler beim Laden
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = filters.search || filters.city || filters.type !== 'all';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Stationen verwalten
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {filteredStations.length} von {stations.length} Stationen
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showInactive}
                    onChange={(e) => handleFilterChange('showInactive', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span>Inaktive anzeigen</span>
                </label>
                
                <button
                  onClick={handleCreateStation}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Neue Station</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Name, Adresse, Telefon..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* City Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-colors"
                >
                  <option value="">Alle Städte</option>
                  {allCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-colors"
                >
                  <option value="all">Alle Typen</option>
                  <option value="praesidium">Präsidium</option>
                  <option value="revier">Revier</option>
                </select>
              </div>

              {/* Results & Clear */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {filteredStations.length} Ergebnis{filteredStations.length !== 1 ? 'se' : ''}
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                  >
                    Filter löschen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Station Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {filteredStations.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 w-20 h-20 mx-auto mb-4">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Keine Stationen gefunden
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {hasActiveFilters 
                  ? 'Versuchen Sie, die Filter anzupassen oder zu löschen.' 
                  : 'Erstellen Sie Ihre erste Station.'}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Filter löschen
                </button>
              ) : (
                <button
                  onClick={handleCreateStation}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Erste Station erstellen
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {praesidien.map((praesidium, pIndex) => {
                const praesidiumId = getSafeId(praesidium, pIndex);
                const reviere = getReviere(praesidium.id);
                
                return (
                  <div key={praesidiumId} className="animate-in fade-in-50 duration-200">
                    <StationCard
                      station={praesidium}
                      onEdit={handleEditStation}
                      onDelete={handleDeleteStation}
                      isExpanded={expandedPresidia.has(praesidium.id)}
                      onToggle={() => togglePraesidiumExpansion(praesidium.id)}
                    >
                      {expandedPresidia.has(praesidium.id) && reviere.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50">
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Reviere ({reviere.length})
                            </h4>
                            {reviere.map((revier, rIndex) => {
                              const revierId = getSafeId(revier, rIndex);
                              return (
                                <StationCard
                                  key={revierId}
                                  station={revier}
                                  onEdit={handleEditStation}
                                  onDelete={handleDeleteStation}
                                  isExpanded={false}
                                  onToggle={() => {}}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </StationCard>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        <StationModal
          station={editingStation}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveStation}
          isLoading={isLoading}
          error={error}
          availablePraesidien={availablePraesidien}
        />
      </div>
    </ErrorBoundary>
  );
};

export default AdminStationManagement;