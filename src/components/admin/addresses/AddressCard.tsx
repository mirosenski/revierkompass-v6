import React from 'react'
import { MapPin, Edit2, Trash2, Check, X, Clock, User, Building2 } from 'lucide-react'
import { AddressCardProps } from './types'

const AddressCard: React.FC<AddressCardProps> = ({ 
  address, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full">
            <Check className="w-3 h-3" />
            Genehmigt
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-full">
            <X className="w-3 h-3" />
            Abgelehnt
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-full">
            <Clock className="w-3 h-3" />
            Ausstehend
          </span>
        )
    }
  }

  const getPraesidiumName = (parentId: string | undefined) => {
    if (!parentId) return 'Kein Präsidium zugeordnet'
    // Hier würde normalerweise die Präsidium-Name-Logik stehen
    return 'Präsidium Stuttgart' // Placeholder
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-lg p-2">
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {address.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {address.street}, {address.zipCode} {address.city}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(address.reviewStatus)}
            {!address.isActive && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                Inaktiv
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Koordinaten
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {address.coordinates[0]?.toFixed(4)}, {address.coordinates[1]?.toFixed(4)}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Präsidium
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getPraesidiumName(address.parentId)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {address.isVerified && (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                Verifiziert
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              ID: {address.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onApprove && address.reviewStatus === 'pending' && (
              <button
                onClick={() => onApprove(address.id)}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Genehmigen"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            
            {onReject && address.reviewStatus === 'pending' && (
              <button
                onClick={() => onReject(address.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Ablehnen"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onEdit(address)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              title="Bearbeiten"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDelete(address.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressCard 