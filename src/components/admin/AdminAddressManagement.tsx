import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, MapPin, Check, X, Clock, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import adminAddressService, { Address, CreateAddressData, UpdateAddressData } from '@/services/api/admin-address.service'

interface AddressModalProps {
  address: Address | null
  isOpen: boolean
  onClose: () => void
  onSave: (address: CreateAddressData | UpdateAddressData) => void
}

const AddressModal: React.FC<AddressModalProps> = ({ address, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    zipCode: '',
    city: '',
    coordinates: [0, 0] as [number, number],
    isVerified: false,
    isActive: true,
    reviewStatus: 'pending' as 'pending' | 'approved' | 'rejected',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (address && isOpen) {
      setFormData({
        name: address.name || '',
        street: address.street || '',
        zipCode: address.zipCode || '',
        city: address.city || '',
        coordinates: address.coordinates || [0, 0],
        isVerified: address.isVerified || false,
        isActive: address.isActive !== false,
        reviewStatus: address.reviewStatus || 'pending',
      })
    } else if (!address && isOpen) {
      setFormData({
        name: '',
        street: '',
        zipCode: '',
        city: '',
        coordinates: [0, 0],
        isVerified: false,
        isActive: true,
        reviewStatus: 'pending',
      })
    }
  }, [address, isOpen])

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = 'Name ist erforderlich'
    if (!formData.street) newErrors.street = 'Straße ist erforderlich'
    if (!formData.zipCode) newErrors.zipCode = 'PLZ ist erforderlich'
    if (!formData.city) newErrors.city = 'Stadt ist erforderlich'
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
              {address ? 'Adresse bearbeiten' : 'Neue Adresse erstellen'}
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
                  Straße *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.street ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PLZ *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
                {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.reviewStatus}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    reviewStatus: e.target.value as 'pending' | 'approved' | 'rejected'
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="pending">Ausstehend</option>
                  <option value="approved">Genehmigt</option>
                  <option value="rejected">Abgelehnt</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verifiziert</span>
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

const AdminAddressManagement: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setIsLoading(true)
      const data = await adminAddressService.getAllAddresses()
      setAddresses(data)
    } catch (error) {
      console.error('Fehler beim Laden der Adressen:', error)
      toast.error('Fehler beim Laden der Adressen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (formData: CreateAddressData | UpdateAddressData) => {
    try {
      if (editingAddress) {
        // Update existing address
        const updatedAddress = await adminAddressService.updateAddress(editingAddress.id, formData as UpdateAddressData)
        setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? updatedAddress : addr))
        toast.success('Adresse erfolgreich aktualisiert')
      } else {
        // Create new address
        const newAddress = await adminAddressService.createAddress(formData as CreateAddressData)
        setAddresses(prev => [...prev, newAddress])
        toast.success('Adresse erfolgreich erstellt')
      }
      setEditingAddress(null)
      setIsModalOpen(false)
    } catch (err) {
      console.error('Fehler beim Speichern:', err)
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diese Adresse wirklich löschen?')) {
      try {
        await adminAddressService.deleteAddress(id)
        setAddresses(prev => prev.filter(addr => addr.id !== id))
        toast.success('Adresse gelöscht')
      } catch (err) {
        console.error('Fehler beim Löschen:', err)
        toast.error('Fehler beim Löschen')
      }
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const updatedAddress = await adminAddressService.approveAddress(id)
      setAddresses(prev => prev.map(addr => addr.id === id ? updatedAddress : addr))
      toast.success('Adresse genehmigt')
    } catch (err) {
      console.error('Fehler beim Genehmigen:', err)
      toast.error('Fehler beim Genehmigen')
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Grund für die Ablehnung:')
    if (reason !== null) {
      try {
        const updatedAddress = await adminAddressService.rejectAddress(id, reason)
        setAddresses(prev => prev.map(addr => addr.id === id ? updatedAddress : addr))
        toast.success('Adresse abgelehnt')
      } catch (err) {
        console.error('Fehler beim Ablehnen:', err)
        toast.error('Fehler beim Ablehnen')
      }
    }
  }

  const filteredAddresses = addresses.filter(addr => {
    const matchesSearch = 
      addr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || addr.reviewStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Ausstehend</span>
      case 'approved':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Genehmigt</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Abgelehnt</span>
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Unbekannt</span>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Adressen verwalten
            </h1>
            <button
              onClick={() => {
                setEditingAddress(null)
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Neue Adresse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
              >
                <option value="all">Alle Status</option>
                <option value="pending">Ausstehend</option>
                <option value="approved">Genehmigt</option>
                <option value="rejected">Abgelehnt</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Address List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {filteredAddresses.map((address) => (
            <div
              key={address.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {address.name}
                    </h3>
                    {getStatusBadge(address.reviewStatus)}
                    {address.isVerified && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{address.street}, {address.zipCode} {address.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Erstellt: {new Date(address.createdAt).toLocaleDateString('de-DE')}</span>
                    </div>
                    {address.user && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{address.user.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {address.reviewStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(address.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">Genehmigen</span>
                      </button>
                      <button
                        onClick={() => handleReject(address.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Ablehnen</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setEditingAddress(address)
                      setIsModalOpen(true)
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Bearbeiten</span>
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredAddresses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Keine Adressen gefunden' 
                  : 'Noch keine Adressen vorhanden'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddressModal
        address={editingAddress}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAddress(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}

export default AdminAddressManagement 