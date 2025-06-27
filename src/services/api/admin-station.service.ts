import { Station } from '@/types/station.types'
import {
  fetchStations,
  createStation,
  updateStation,
  deleteStation,
} from './backend-api.service'

export interface AdminStationService {
  createStation: (
    station: Omit<Station, 'id' | 'lastModified'>
  ) => Promise<Station>
  updateStation: (id: string, updates: Partial<Station>) => Promise<Station>
  deleteStation: (id: string) => Promise<boolean>
  toggleStationActive: (id: string) => Promise<Station>
  bulkUpdateStations: (
    updates: Array<{ id: string; changes: Partial<Station> }>
  ) => Promise<Station[]>
}

export const adminStationService: AdminStationService = {
  async createStation(station) {
    return createStation(station)
  },

  async updateStation(id, updates) {
    return updateStation(id, updates)
  },

  async deleteStation(id) {
    await deleteStation(id)
    return true
  },

  async toggleStationActive(id) {
    const stations = await fetchStations()
    const current = stations.find((s) => s.id === id)
    if (!current) throw new Error('Station not found')
    return updateStation(id, { isActive: !current.isActive })
  },

  async bulkUpdateStations(updates) {
    const promises = updates.map(({ id, changes }) =>
      updateStation(id, changes)
    )
    return Promise.all(promises)
  },
}
