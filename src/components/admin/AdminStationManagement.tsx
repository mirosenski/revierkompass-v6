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
    <div className={`
      relative overflow-hidden rounded-2xl transition-all duration-300
      ${isPraesidium 
        ? 'bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm shadow-lg' 
        : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md ml-4 md:ml-8'}
      hover:shadow-xl hover:scale-[1.02] border border-gray-100/50 dark:border-gray-700/50
    `}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4 flex gap-2">
        {station.notdienst24h && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
            <Clock className="w-3 h-3" />
            24h
          </span>
        )}
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          station.isActive 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
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
    ...station
  })

  if (!isOpen) return null

  const handleSave = () => {
    if (!formData.name || !formData.address || !formData.city || !formData.telefon || !formData.coordinates[0] || !formData.coordinates[1]) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }
    onSave(formData)
    onClose()
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Typ *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as StationType }))}
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stadt *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
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
                    placeholder="Latitude"
                    value={formData.coordinates[0]}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      coordinates: [Number(e.target.value), prev.coordinates[1]]
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={formData.coordinates[1]}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      coordinates: [prev.coordinates[0], Number(e.target.value)]
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
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
    try {
      if (editingStation) {
        await updateStation(editingStation.id, formData)
        toast.success('Station erfolgreich aktualisiert')
      } else {
        await createStation(formData as Station)
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
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Neue Station</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters with Glass Effect */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 sm:p-6">
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

            <div className="flex items-center justify-center sm:justify-end">
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {filteredStations.length} {filteredStations.length === 1 ? 'Station' : 'Stationen'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Station Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {praesidien.map(praesidium => (
            <div key={praesidium.id}>
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
                    {getReviere(praesidium.id).map(revier => (
                      <StationCard
                        key={revier.id}
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