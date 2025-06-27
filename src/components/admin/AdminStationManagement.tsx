import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAdminStore } from '@/store/useAdminStore'
import { Station, StationType } from '@/types/station.types'

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

  // Filter & Sort State
  const [cityFilter, setCityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'type'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [expandedPresidia, setExpandedPresidia] = useState<Set<string>>(new Set())

  const [newStation, setNewStation] = useState<Partial<Station>>({})
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Station>>({})

  useEffect(() => {
    loadStations()
  }, [loadStations])

  // Filter- und Sortierlogik
  const filteredStations = stations
    .filter((s) => (cityFilter ? s.city === cityFilter : true))
    .filter((s) => (typeFilter !== 'all' ? s.type === typeFilter : true))
    .sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const cmp = aValue.localeCompare(bValue)
        return sortOrder === 'asc' ? cmp : -cmp
      }
      return 0
    })

  // Städte für Dropdown
  const allCities = Array.from(new Set(stations.map((s) => s.city))).sort()

  // Präsidien und zugehörige Reviere für hierarchische Ansicht
  const praesidien = filteredStations.filter((s) => s.type === 'praesidium')
  const getReviere = (praesidiumId: string) =>
    filteredStations.filter((s) => s.type === 'revier' && s.parentId === praesidiumId)

  const handleCreate = async () => {
    try {
      if (!newStation.name || !newStation.coordinates?.[0] || !newStation.coordinates?.[1] || !newStation.address || !newStation.city || !newStation.telefon) {
        toast.error('Bitte füllen Sie alle erforderlichen Felder aus')
        return
      }

      await createStation({
        ...newStation,
        coordinates: [newStation.coordinates[0], newStation.coordinates[1]],
        isActive: true,
        notdienst24h: newStation.notdienst24h || false,
      } as Station)

      setNewStation({})
      toast.success('Station erfolgreich erstellt')
    } catch (err) {
      console.error('Erstellung fehlgeschlagen:', err)
      toast.error('Fehler bei der Station-Erstellung')
    }
  }

  const handleEdit = (station: Station) => {
    setEditingStation(station)
    setEditFormData({
      name: station.name,
      address: station.address,
      city: station.city,
      telefon: station.telefon,
      email: station.email,
      coordinates: station.coordinates,
      type: station.type,
      notdienst24h: station.notdienst24h,
      isActive: station.isActive,
      parentId: station.parentId,
    })
  }

  const handleUpdate = async () => {
    if (!editingStation) return

    try {
      if (!editFormData.name || !editFormData.coordinates?.[0] || !editFormData.coordinates?.[1] || !editFormData.address || !editFormData.city || !editFormData.telefon) {
        toast.error('Bitte füllen Sie alle erforderlichen Felder aus')
        return
      }

      await updateStation(editingStation.id, {
        ...editFormData,
        coordinates: [editFormData.coordinates[0], editFormData.coordinates[1]],
        type: editFormData.type || editingStation.type,
      })

      setEditingStation(null)
      toast.success('Station aktualisiert')
    } catch (error) {
      console.error('Update fehlgeschlagen:', error)
      toast.error('Fehler bei der Aktualisierung')
    }
  }

  if (isLoading) return <div className="p-4 text-gray-500">Lade Stationen...</div>
  if (error) return <div className="p-4 text-red-500">Fehler: {error}</div>

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Stationen verwalten
      </h2>

      {/* Filter & Sortierung */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="">Alle Städte</option>
          {allCities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="all">Alle Typen</option>
          <option value="praesidium">Präsidium</option>
          <option value="revier">Revier</option>
        </select>
        <div className="flex items-center gap-2">
          <span>Sortieren nach:</span>
          <button
            className={`px-2 py-1 rounded ${sortBy === 'name' ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
            onClick={() => setSortBy('name')}
          >Name</button>
          <button
            className={`px-2 py-1 rounded ${sortBy === 'city' ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
            onClick={() => setSortBy('city')}
          >Stadt</button>
          <button
            className={`px-2 py-1 rounded ${sortBy === 'type' ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
            onClick={() => setSortBy('type')}
          >Typ</button>
          <button
            className="px-2 py-1 rounded border"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >{sortOrder === 'asc' ? '⬆️' : '⬇️'}</button>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Neue Station erstellen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Name *"
            value={newStation.name || ''}
            onChange={(e) =>
              setNewStation((prev) => ({ ...prev, name: e.target.value }))
            }
            className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
          />
          <input
            type="text"
            placeholder="Adresse *"
            value={newStation.address || ''}
            onChange={(e) =>
              setNewStation((prev) => ({ ...prev, address: e.target.value }))
            }
            className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
          />
          <input
            type="text"
            placeholder="Stadt *"
            value={newStation.city || ''}
            onChange={(e) =>
              setNewStation((prev) => ({ ...prev, city: e.target.value }))
            }
            className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
          />
          <input
            type="text"
            placeholder="Telefon *"
            value={newStation.telefon || ''}
            onChange={(e) =>
              setNewStation((prev) => ({ ...prev, telefon: e.target.value }))
            }
            className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
          />
          <input
            type="email"
            placeholder="E-Mail"
            value={newStation.email || ''}
            onChange={(e) =>
              setNewStation((prev) => ({ ...prev, email: e.target.value }))
            }
            className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
          />
          <select
            value={newStation.type || ''}
            onChange={(e) =>
              setNewStation((prev) => ({
                ...prev,
                type: e.target.value as StationType,
              }))
            }
            className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="">Typ wählen *</option>
            <option value="praesidium">Präsidium</option>
            <option value="revier">Revier</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.0001"
              placeholder="Latitude *"
              value={newStation.coordinates?.[0] || ''}
              onChange={(e) =>
                setNewStation((prev) => ({
                  ...prev,
                  coordinates: [
                    Number(e.target.value),
                    prev.coordinates?.[1] || 0,
                  ],
                }))
              }
              className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Longitude *"
              value={newStation.coordinates?.[1] || ''}
              onChange={(e) =>
                setNewStation((prev) => ({
                  ...prev,
                  coordinates: [
                    prev.coordinates?.[0] || 0,
                    Number(e.target.value),
                  ],
                }))
              }
              className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newStation.notdienst24h || false}
                onChange={(e) =>
                  setNewStation((prev) => ({ ...prev, notdienst24h: e.target.checked }))
                }
                className="rounded"
              />
              <span className="text-sm">24h Notdienst</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newStation.isActive !== false}
                onChange={(e) =>
                  setNewStation((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="rounded"
              />
              <span className="text-sm">Aktiv</span>
            </label>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Erstellen</span>
          </button>
        </div>
      </div>

      {/* Hierarchische Tabelle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Bestehende Stationen</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Typ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stadt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {praesidien.map((praesidium) => (
                <React.Fragment key={praesidium.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 font-bold">
                    <td className="px-2 py-4">
                      <button
                        onClick={() => {
                          const newSet = new Set(expandedPresidia)
                          if (expandedPresidia.has(praesidium.id)) {
                            newSet.delete(praesidium.id)
                          } else {
                            newSet.add(praesidium.id)
                          }
                          setExpandedPresidia(newSet)
                        }}
                        className="focus:outline-none"
                        aria-label="Reviere anzeigen/verstecken"
                      >
                        {expandedPresidia.has(praesidium.id) ? <ChevronDown /> : <ChevronRight />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{praesidium.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">Präsidium</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{praesidium.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{praesidium.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{praesidium.telefon}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${praesidium.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>{praesidium.isActive ? 'Aktiv' : 'Inaktiv'}</span>
                      {praesidium.notdienst24h && <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">24h</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEdit(praesidium)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900"><Edit2 className="h-5 w-5" /></button>
                        <button onClick={() => deleteStation(praesidium.id)} className="text-red-600 dark:text-red-400 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                      </div>
                    </td>
                  </tr>
                  {/* Zugehörige Reviere */}
                  {expandedPresidia.has(praesidium.id) && getReviere(praesidium.id).map((revier) => (
                    <tr key={revier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td></td>
                      <td className="px-6 py-4 whitespace-nowrap pl-8">{revier.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">Revier</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{revier.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{revier.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{revier.telefon}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${revier.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>{revier.isActive ? 'Aktiv' : 'Inaktiv'}</span>
                        {revier.notdienst24h && <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">24h</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleEdit(revier)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900"><Edit2 className="h-5 w-5" /></button>
                          <button onClick={() => deleteStation(revier.id)} className="text-red-600 dark:text-red-400 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminStationManagement
