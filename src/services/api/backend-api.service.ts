import axios from 'axios'
import { Station } from '@/types/station.types'

const API_URL = 'http://localhost:3001/api/stationen'

export const fetchStations = async (): Promise<Station[]> => {
  const response = await axios.get(API_URL)
  return response.data
}

export const createStation = async (
  station: Omit<Station, 'id' | 'lastModified'>
): Promise<Station> => {
  const response = await axios.post(API_URL, station)
  return response.data
}

export const updateStation = async (
  id: string,
  updates: Partial<Station>
): Promise<Station> => {
  const response = await axios.put(`${API_URL}/${id}`, updates)
  return response.data
}

export const deleteStation = async (id: string): Promise<string> => {
  await axios.delete(`${API_URL}/${id}`)
  return id
}
