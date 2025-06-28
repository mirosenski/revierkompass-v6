import { create } from 'zustand'
import { Station } from '@/types/station.types'
import {
  fetchStations,
  createStation as apiCreateStation,
  updateStation as apiUpdateStation,
  deleteStation as apiDeleteStation,
} from '@/services/api/backend-api.service'

interface AdminStore {
  stations: Station[]
  isLoading: boolean
  error: string | null

  loadStations: () => Promise<void>
  createStation: (
    station: Omit<Station, 'id' | 'lastModified'>
  ) => Promise<void>
  updateStation: (id: string, updates: Partial<Station>) => Promise<void>
  deleteStation: (id: string) => Promise<void>
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  stations: [],
  isLoading: false,
  error: null,

  loadStations: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await fetchStations()
      set({ stations: data, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },

  createStation: async (station) => {
    set({ isLoading: true, error: null })
    try {
      const created = await apiCreateStation(station)
      const updatedStations = await fetchStations()
      set({ stations: updatedStations, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },

  updateStation: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await apiUpdateStation(id, updates)
      const updatedStations = await fetchStations()
      set({ stations: updatedStations, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },

  deleteStation: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await apiDeleteStation(id)
      const updatedStations = await fetchStations()
      set({ stations: updatedStations, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },


}))
