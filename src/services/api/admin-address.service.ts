import axios from 'axios'

// Verwende Vite Proxy statt direkter Backend-URL
const API_URL = '/api/stationen'

export interface Address {
  id: string
  name: string
  street: string
  zipCode: string
  city: string
  coordinates: [number, number]
  isVerified: boolean
  isActive: boolean
  reviewStatus: 'pending' | 'approved' | 'rejected'
  createdAt: string
  user?: {
    id: string
    email: string
  }
}

export interface CreateAddressData {
  name: string
  street: string
  zipCode: string
  city: string
  coordinates: [number, number]
  isVerified?: boolean
  isActive?: boolean
  reviewStatus?: 'pending' | 'approved' | 'rejected'
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

export const adminAddressService = {
  // Alle Adressen abrufen (als Stationen mit speziellem Typ)
  async getAllAddresses(): Promise<Address[]> {
    try {
      const response = await axios.get(API_URL)
      // Filtere nur Adressen (Stationen mit speziellem Typ oder ohne parentId)
      const addresses = response.data.filter((station: any) => 
        station.type === 'address' || !station.parentId || station.type === 'custom'
      )
      return addresses.map((station: any) => ({
        id: station.id,
        name: station.name,
        street: station.address,
        zipCode: station.zipCode || '',
        city: station.city,
        coordinates: station.coordinates,
        isVerified: station.isVerified || false,
        isActive: station.isActive,
        reviewStatus: station.reviewStatus || 'pending',
        createdAt: station.lastModified,
        user: station.user
      }))
    } catch (error) {
      console.error('Fehler beim Laden der Adressen:', error)
      throw error
    }
  },

  // Neue Adresse erstellen (als Station)
  async createAddress(addressData: CreateAddressData): Promise<Address> {
    try {
      const stationData = {
        name: addressData.name,
        type: 'address',
        city: addressData.city,
        address: addressData.street,
        coordinates: addressData.coordinates,
        telefon: '',
        email: '',
        notdienst24h: false,
        isActive: addressData.isActive !== false,
        isVerified: addressData.isVerified || false,
        reviewStatus: addressData.reviewStatus || 'pending',
        zipCode: addressData.zipCode
      }
      
      const response = await axios.post(API_URL, stationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return {
        id: response.data.id,
        name: response.data.name,
        street: response.data.address,
        zipCode: response.data.zipCode || '',
        city: response.data.city,
        coordinates: response.data.coordinates,
        isVerified: response.data.isVerified || false,
        isActive: response.data.isActive,
        reviewStatus: response.data.reviewStatus || 'pending',
        createdAt: response.data.lastModified,
        user: response.data.user
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Adresse:', error)
      throw error
    }
  },

  // Adresse aktualisieren
  async updateAddress(id: string, addressData: UpdateAddressData): Promise<Address> {
    try {
      const stationData: any = {}
      if (addressData.name) stationData.name = addressData.name
      if (addressData.street) stationData.address = addressData.street
      if (addressData.city) stationData.city = addressData.city
      if (addressData.coordinates) stationData.coordinates = addressData.coordinates
      if (addressData.zipCode) stationData.zipCode = addressData.zipCode
      if (addressData.isVerified !== undefined) stationData.isVerified = addressData.isVerified
      if (addressData.isActive !== undefined) stationData.isActive = addressData.isActive
      if (addressData.reviewStatus) stationData.reviewStatus = addressData.reviewStatus
      
      const response = await axios.put(`${API_URL}/${id}`, stationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return {
        id: response.data.id,
        name: response.data.name,
        street: response.data.address,
        zipCode: response.data.zipCode || '',
        city: response.data.city,
        coordinates: response.data.coordinates,
        isVerified: response.data.isVerified || false,
        isActive: response.data.isActive,
        reviewStatus: response.data.reviewStatus || 'pending',
        createdAt: response.data.lastModified,
        user: response.data.user
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Adresse:', error)
      throw error
    }
  },

  // Adresse löschen
  async deleteAddress(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`)
    } catch (error) {
      console.error('Fehler beim Löschen der Adresse:', error)
      throw error
    }
  },

  // Adresse genehmigen
  async approveAddress(id: string): Promise<Address> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, { 
        reviewStatus: 'approved',
        isVerified: true 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return {
        id: response.data.id,
        name: response.data.name,
        street: response.data.address,
        zipCode: response.data.zipCode || '',
        city: response.data.city,
        coordinates: response.data.coordinates,
        isVerified: response.data.isVerified || false,
        isActive: response.data.isActive,
        reviewStatus: response.data.reviewStatus || 'pending',
        createdAt: response.data.lastModified,
        user: response.data.user
      }
    } catch (error) {
      console.error('Fehler beim Genehmigen der Adresse:', error)
      throw error
    }
  },

  // Adresse ablehnen
  async rejectAddress(id: string, reason?: string): Promise<Address> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, { 
        reviewStatus: 'rejected',
        isActive: false
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return {
        id: response.data.id,
        name: response.data.name,
        street: response.data.address,
        zipCode: response.data.zipCode || '',
        city: response.data.city,
        coordinates: response.data.coordinates,
        isVerified: response.data.isVerified || false,
        isActive: response.data.isActive,
        reviewStatus: response.data.reviewStatus || 'pending',
        createdAt: response.data.lastModified,
        user: response.data.user
      }
    } catch (error) {
      console.error('Fehler beim Ablehnen der Adresse:', error)
      throw error
    }
  },

  // Ausstehende Adressen abrufen
  async getPendingAddresses(): Promise<Address[]> {
    try {
      const response = await axios.get(API_URL)
      const pendingAddresses = response.data.filter((station: any) => 
        (station.type === 'address' || !station.parentId) && 
        station.reviewStatus === 'pending'
      )
      return pendingAddresses.map((station: any) => ({
        id: station.id,
        name: station.name,
        street: station.address,
        zipCode: station.zipCode || '',
        city: station.city,
        coordinates: station.coordinates,
        isVerified: station.isVerified || false,
        isActive: station.isActive,
        reviewStatus: station.reviewStatus || 'pending',
        createdAt: station.lastModified,
        user: station.user
      }))
    } catch (error) {
      console.error('Fehler beim Laden ausstehender Adressen:', error)
      throw error
    }
  },

  // Adress-Statistiken abrufen
  async getAddressStats(): Promise<any> {
    try {
      const response = await axios.get(API_URL)
      const addresses = response.data.filter((station: any) => 
        station.type === 'address' || !station.parentId
      )
      
      const total = addresses.length
      const pending = addresses.filter((a: any) => a.reviewStatus === 'pending').length
      const approved = addresses.filter((a: any) => a.reviewStatus === 'approved').length
      const rejected = addresses.filter((a: any) => a.reviewStatus === 'rejected').length
      
      return {
        total,
        pending,
        approved,
        rejected,
        verified: addresses.filter((a: any) => a.isVerified).length
      }
    } catch (error) {
      console.error('Fehler beim Laden der Adress-Statistiken:', error)
      throw error
    }
  }
}

export default adminAddressService 