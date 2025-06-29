import React from 'react'
import { MapPin, Edit2, Trash2, Check, X, Clock, User, Building2, Database, Timer } from 'lucide-react'
import { AddressCardProps } from './types'

const AddressCard: React.FC<AddressCardProps> = ({ 
  address, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject,
  currentUser 
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

  const getAddressTypeBadge = (addressType: string) => {
    switch (addressType) {
      case 'temporary':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 rounded-full">
            <Timer className="w-3 h-3" />
            Temporär
          </span>
        )
      case 'permanent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
            <Database className="w-3 h-3" />
            Permanent
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
            <Database className="w-3 h-3" />
            Unbekannt
          </span>
        )
    }
  }

  const getPraesidiumName = (parentId: string | undefined) => {
    if (!parentId) return 'Kein Präsidium zugeordnet'
    // Hier würde normalerweise die Präsidium-Name-Logik stehen
    return 'Präsidium Stuttgart' // Placeholder
  }

  // Berechtigungsprüfung für moderne React-Patterns
  const isOwner = address.userId === currentUser?.id
  const isAdmin = currentUser?.role === 'admin'
  const isTemporary = address.addressType === 'temporary'
  const canEdit = isTemporary || isOwner || isAdmin
  const canDelete = isTemporary || isOwner || isAdmin
  const canApprove = isAdmin && address.reviewStatus === 'pending'
  const canReject = isAdmin && address.reviewStatus === 'pending'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 flex flex-col h-full">
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-lg p-2 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 break-words">
                {address.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm break-words">
                {address.street}, {address.zipCode} {address.city}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge(address.reviewStatus)}
            {getAddressTypeBadge(address.addressType || 'permanent')}
            {!address.isActive && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                Inaktiv
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide">
              Koordinaten
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {address.coordinates?.[0]?.toFixed(4) || 'N/A'}, {address.coordinates?.[1]?.toFixed(4) || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide">
              Präsidium
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {getPraesidiumName(address.parentId)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            {address.isVerified && (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                Verifiziert
              </span>
            )}
            {address.isAnonymous && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-orange-500" />
                Anonym
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              ID: {address.id}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Admin-Buttons für Genehmigung/Ablehnung */}
            {canApprove && (
              <button
                onClick={() => onApprove?.(address.id)}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Genehmigen"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            {canReject && (
              <button
                onClick={() => onReject?.(address.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Ablehnen"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Edit-Button - nur für berechtigte Benutzer */}
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(address)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                title="Bearbeiten"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            
            {/* Delete-Button - nur für berechtigte Benutzer */}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(address.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressCard 