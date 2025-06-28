import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, MapPin, AlertTriangle, Database } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAdminStore } from '@/lib/store/admin-store'
import adminAddressService, { Address, CreateAddressData, UpdateAddressData } from '@/services/api/admin-address.service'
import { createAllAalenAddresses } from '@/data/aalen-addresses'
import { AddressFilterState } from './types'
import AddressCard from './AddressCard'
import AddressModal from './AddressModal'
import AddressFilters from './AddressFilters'

// ===== MAIN COMPONENT =====
const AdminAddressManagement: React.FC = () => {
  const { allStations } = useAdminStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<AddressFilterState>({
    search: '',
    city: '',
    status: 'all',
    showInactive: false
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  // Load addresses on mount
  useEffect(() => {
    loadAddresses()
  }, [])

  // Filter addresses based on filters
  useEffect(() => {
    let filtered = addresses

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(addr =>
        addr.name.toLowerCase().includes(searchLower) ||
        addr.street.toLowerCase().includes(searchLower) ||
        addr.city.toLowerCase().includes(searchLower) ||
        addr.zipCode.toLowerCase().includes(searchLower)
      )
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter(addr => addr.city === filters.city)
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(addr => addr.reviewStatus === filters.status)
    }

    // Active/Inactive filter
    if (!filters.showInactive) {
      filtered = filtered.filter(addr => addr.isActive)
    }

    setFilteredAddresses(filtered)
  }, [addresses, filters])

  const loadAddresses = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await adminAddressService.getAllAddresses()
      setAddresses(data)
    } catch (err) {
      console.error('Error loading addresses:', err)
      setError('Fehler beim Laden der Adressen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (formData: CreateAddressData | UpdateAddressData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (editingAddress) {
        await adminAddressService.updateAddress(editingAddress.id, formData as UpdateAddressData)
        toast.success('Adresse erfolgreich aktualisiert')
      } else {
        await adminAddressService.createAddress(formData as CreateAddressData)
        toast.success('Adresse erfolgreich erstellt')
      }
      
      await loadAddresses()
      handleCloseModal()
    } catch (err) {
      console.error('Error saving address:', err)
      setError('Fehler beim Speichern der Adresse')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminAddressService.deleteAddress(id)
      toast.success('Adresse erfolgreich gelöscht')
      await loadAddresses()
    } catch (err) {
      console.error('Error deleting address:', err)
      toast.error('Fehler beim Löschen der Adresse')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await adminAddressService.updateAddress(id, { reviewStatus: 'approved' })
      toast.success('Adresse genehmigt')
      await loadAddresses()
    } catch (err) {
      console.error('Error approving address:', err)
      toast.error('Fehler beim Genehmigen der Adresse')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await adminAddressService.updateAddress(id, { reviewStatus: 'rejected' })
      toast.success('Adresse abgelehnt')
      await loadAddresses()
    } catch (err) {
      console.error('Error rejecting address:', err)
      toast.error('Fehler beim Ablehnen der Adresse')
    }
  }

  // Handle filter changes
  const handleFilterChange = useCallback((field: keyof AddressFilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      city: '',
      status: 'all',
      showInactive: false
    })
  }, [])

  // Handle address creation
  const handleCreateAddress = useCallback(() => {
    setEditingAddress(null)
    setIsModalOpen(true)
  }, [])

  // Handle address editing
  const handleEditAddress = useCallback((address: Address) => {
    setEditingAddress(address)
    setIsModalOpen(true)
  }, [])

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingAddress(null)
  }, [])

  // Get all cities for filter dropdown
  const allCities = useMemo(() => {
    const cities = new Set(addresses.map(addr => addr.city))
    return Array.from(cities).sort()
  }, [addresses])

  // Get available Präsidien for parent selection
  const availablePraesidien = useMemo(() => {
    return allStations.filter(s => s.type === 'praesidium' && s.isActive)
  }, [allStations])

  // Handle create all Aalen addresses
  const handleCreateAllAalenAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const createdCount = await createAllAalenAddresses();
      if (createdCount > 0) {
        await loadAddresses(); // Reload addresses after creation
      }
    } catch (error) {
      console.error('Error creating Aalen addresses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadAddresses]);

  // Loading State
  if (isLoading && addresses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Adressen werden geladen...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error && addresses.length === 0) {
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
    )
  }

  const hasActiveFilters = Boolean(filters.search || filters.city || filters.status !== 'all')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Adressen verwalten
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {filteredAddresses.length} von {addresses.length} Adressen
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
                onClick={handleCreateAddress}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Neue Adresse</span>
              </button>

              <button
                onClick={handleCreateAllAalenAddresses}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Database className="w-5 h-5" />
                <span className="font-medium">Aalen Import</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AddressFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          allCities={allCities}
          hasActiveFilters={hasActiveFilters}
          filteredAddressesCount={filteredAddresses.length}
        />
      </div>

      {/* Address Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 w-20 h-20 mx-auto mb-4">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Keine Adressen gefunden
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {hasActiveFilters 
                ? 'Versuchen Sie, die Filter anzupassen oder zu löschen.' 
                : 'Erstellen Sie Ihre erste Adresse.'}
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
                onClick={handleCreateAddress}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Erste Adresse erstellen
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAddresses.map((address) => (
              <div key={address.id} className="animate-in fade-in-50 duration-200">
                <AddressCard
                  address={address}
                  onEdit={handleEditAddress}
                  onDelete={handleDelete}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AddressModal
        address={editingAddress}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        isLoading={isLoading}
        error={error}
        availablePraesidien={availablePraesidien}
      />
    </div>
  )
}

export default AdminAddressManagement 