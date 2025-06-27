import axios from 'axios'
import { Station } from '@/types/station.types'

const API_URL = 'http://localhost:3001/api/stationen'

export const fetchStations = async (): Promise<Station[]> => {
  try {
    console.log('🔄 Lade Stationen vom Backend-Server...');
    const response = await axios.get(API_URL, { 
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Stationen erfolgreich geladen:', response.data.length, 'Stationen');
    return response.data;
  } catch (error) {
    console.error('❌ Fehler beim Laden der Stationen:', error);
    throw new Error('Stationen konnten nicht geladen werden');
  }
}

export const createStation = async (station: Omit<Station, 'id' | 'lastModified'>): Promise<Station> => {
  try {
    console.log('🔄 Erstelle neue Station...');
    const response = await axios.post(API_URL, station, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Station erfolgreich erstellt:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Station:', error);
    throw error;
  }
}

export const updateStation = async (id: string, station: Partial<Station>): Promise<Station> => {
  try {
    console.log('🔄 Aktualisiere Station:', id);
    const response = await axios.put(`${API_URL}/${id}`, station, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Station erfolgreich aktualisiert:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der Station:', error);
    throw error;
  }
}

export const deleteStation = async (id: string): Promise<void> => {
  try {
    console.log('🔄 Lösche Station:', id);
    await axios.delete(`${API_URL}/${id}`);
    console.log('✅ Station erfolgreich gelöscht');
  } catch (error) {
    console.error('❌ Fehler beim Löschen der Station:', error);
    throw error;
  }
}
