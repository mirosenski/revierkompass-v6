import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Search, Filter, MapPin, Phone, Mail, Clock, Building2, X, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAdminStore } from '@/store/useAdminStore'
import { Station, StationType } from '@/types/station.types'

interface StationCardProps {
  station: any;
  onEdit: any;
  onDelete: any;
  isExpanded: any;
  onToggle: any;
  children?: React.ReactNode;
}

const StationCard: React.FC<StationCardProps> = ({ station, onEdit, onDelete, isExpanded, onToggle, children }) => {
  const isPraesidium = station.type === 'praesidium'
  
  return (
    <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
      isPraesidium 
        ? 'bg-blue-50 dark:bg-blue-900/10 backdrop-blur-sm shadow-lg' 
        : 'bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm shadow-md ml-4 md:ml-8'
    } hover:shadow-xl hover:scale-[1.01] border border-gray-100/50 dark:border-gray-700/50`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4 flex gap-2">
        {station.notdienst24h && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            24h
          </span>
        )}
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          station.isActive 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {station.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {station.isActive ? 'Aktiv' : 'Inaktiv'}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isPraesidium && (
              <button
                onClick={onToggle}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={isExpanded ? 'Reviere ausblenden' : 'Reviere anzeigen'}
              >
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400" />
                {station.name}
              </h3>
              <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                isPraesidium 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              }`}>
                {isPraesidium ? 'Präsidium' : 'Revier'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{station.address}, {station.city}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Phone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${station.telefon}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {station.telefon}
            </a>
          </div>
          {station.email && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Mail className="w-4 h-4 text-gray-400" />
              <a href={`mailto:${station.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                {station.email}
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(station)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            aria-label={`${station.name} bearbeiten`}
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Bearbeiten</span>
          </button>
          <button
            onClick={() => onDelete(station.id)}
            className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            aria-label={`${station.name} löschen`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}

// Modern Modal Component
const StationModal = ({ station, isOpen, onClose, onSave }) => {
  const { stations } = useAdminStore();
  const [formData, setFormData] = useState({
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
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (station && isOpen) {
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
      })
    } else if (!station && isOpen) {
      setFormData({
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
      })
    }
  }, [station, isOpen])

  // Präsidien für Dropdown filtern
  const availablePraesidien = stations.filter(s => s.type === 'praesidium' && s.isActive);

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = 'Name ist erforderlich'
    if (!formData.address) newErrors.address = 'Adresse ist erforderlich'
    if (!formData.city) newErrors.city = 'Stadt ist erforderlich'
    if (!formData.telefon) newErrors.telefon = 'Telefon ist erforderlich'
    if (!formData.coordinates[0] || !formData.coordinates[1]) 
      newErrors.coordinates = 'Koordinaten sind erforderlich'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {station ? 'Station bearbeiten' : 'Neue Station erstellen'}
            </h3>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Typ *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as StationType, parentId: '' }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="praesidium">Präsidium</option>
                  <option value="revier">Revier</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stadt *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.telefon ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
                {errors.telefon && <p className="text-red-500 text-xs mt-1">{errors.telefon}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Koordinaten *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Breitengrad"
                    value={formData.coordinates[0]}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      coordinates: [Number(e.target.value), prev.coordinates[1]] 
                    }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.coordinates ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Längengrad"
                    value={formData.coordinates[1]}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      coordinates: [prev.coordinates[0], Number(e.target.value)] 
                    }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.coordinates ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  />
                </div>
                {errors.coordinates && <p className="text-red-500 text-xs mt-1">{errors.coordinates}</p>}
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notdienst24h}
                    onChange={(e) => setFormData(prev => ({ ...prev, notdienst24h: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">24h Notdienst</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aktiv</span>
                </label>
              </div>

              {/* Präsidium-Auswahl nur für Revier */}
              {formData.type === 'revier' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Building2 className="inline w-4 h-4 mr-1" />
                    Präsidium zuordnen
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Bitte wählen…</option>
                    {availablePraesidien.map((praesidium) => (
                      <option key={praesidium.id} value={praesidium.id}>
                        {praesidium.name} ({praesidium.city})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Wählen Sie das übergeordnete Präsidium für dieses Revier.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const AdminStationManagement: React.FC = () => {
  const {
    stations,
    isLoading,
    error,
    loadStations,
    createStation,
    deleteStation,
    updateStation,
  } = useAdminStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [expandedPresidia, setExpandedPresidia] = useState<Set<string>>(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStation, setEditingStation] = useState<Station | null>(null)

  useEffect(() => {
    loadStations()
  }, [loadStations])

  // Lade Stationen auch nach Änderungen neu
  useEffect(() => {
    const interval = setInterval(() => {
      loadStations()
    }, 10000) // Alle 10 Sekunden neu laden
    
    return () => clearInterval(interval)
  }, [loadStations])

  useEffect(() => {
    setExpandedPresidia(new Set(stations.filter(s => s.type === 'praesidium').map(s => s.id)))
  }, [stations])

  // Filter logic
  const filteredStations = stations
    .filter(s => 
      searchTerm === '' || 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(s => cityFilter === '' || s.city === cityFilter)
    .filter(s => typeFilter === 'all' || s.type === typeFilter)

  const allCities = Array.from(new Set(stations.map(s => s.city))).sort()
  const praesidien = filteredStations.filter(s => s.type === 'praesidium')
  const getReviere = (praesidiumId: string) =>
    filteredStations.filter(s => s.type === 'revier' && s.parentId === praesidiumId)

  const handleSave = async (formData: Partial<Station>) => {
    const {
      name,
      type,
      city,
      address,
      coordinates,
      telefon,
      email,
      notdienst24h,
      isActive,
      parentId,
    } = formData

    const newStationData = {
      name,
      type,
      city,
      address,
      coordinates,
      telefon,
      email,
      notdienst24h,
      isActive,
      parentId,
    }

    try {
      if (editingStation) {
        await updateStation(editingStation.id, newStationData)
        toast.success('Station erfolgreich aktualisiert')
      } else {
        await createStation(newStationData as Station)
        toast.success('Station erfolgreich erstellt')
      }
      setEditingStation(null)
      setIsModalOpen(false)
    } catch (err) {
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diese Station wirklich löschen?')) {
      try {
        await deleteStation(id)
        toast.success('Station gelöscht')
      } catch (err) {
        toast.error('Fehler beim Löschen')
      }
    }
  }

  // Hilfsfunktion für sichere IDs
  const safeId = (s: any, idx: number) => (s.id && typeof s.id === 'string' && s.id !== 'NaN') ? s.id : `fallback-${s.name || 'station'}-${idx}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Fehler beim Laden</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Stationen verwalten
            </h1>
            <button
              onClick={() => {
                setEditingStation(null)
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Neue Station</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters with Glass Effect */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
              >
                <option value="">Alle Städte</option>
                {allCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
              >
                <option value="all">Alle Typen</option>
                <option value="praesidium">Präsidium</option>
                <option value="revier">Revier</option>
              </select>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {filteredStations.length} {filteredStations.length === 1 ? 'Station' : 'Stationen'}
              </span>
              {(cityFilter || typeFilter !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCityFilter('');
                    setTypeFilter('all');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Filter löschen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Station Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {praesidien.map((praesidium, pIndex) => (
            <div key={safeId(praesidium, pIndex)}>
              <StationCard
                station={praesidium}
                onEdit={(station) => {
                  setEditingStation(station)
                  setIsModalOpen(true)
                }}
                onDelete={handleDelete}
                isExpanded={expandedPresidia.has(praesidium.id)}
                onToggle={() => {
                  const newSet = new Set(expandedPresidia)
                  if (expandedPresidia.has(praesidium.id)) {
                    newSet.delete(praesidium.id)
                  } else {
                    newSet.add(praesidium.id)
                  }
                  setExpandedPresidia(newSet)
                }}
              >
                {expandedPresidia.has(praesidium.id) && (
                  <div className="border-t dark:border-gray-700 p-4 space-y-3">
                    {getReviere(praesidium.id).map((revier, rIndex) => (
                      <StationCard
                        key={safeId(revier, rIndex)}
                        station={revier}
                        onEdit={(station) => {
                          setEditingStation(station)
                          setIsModalOpen(true)
                        }}
                        onDelete={handleDelete}
                        isExpanded={false}
                        onToggle={() => {}}
                      />
                    ))}
                  </div>
                )}
              </StationCard>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <StationModal
        station={editingStation}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingStation(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}

export default AdminStationManagement
