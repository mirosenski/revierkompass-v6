import { useEffect } from 'react'
import { useAdminStore } from '@/store/useAdminStore'

const AdminDashboard = () => {
  const { stations, isLoading, error, loadStations } = useAdminStore()

  useEffect(() => {
    loadStations()
  }, [loadStations])

  if (isLoading) return <div>⏳ Lädt...</div>
  if (error) return <div>❌ Fehler: {error}</div>

  return (
    <div className="station-list">
      {stations.map((station) => (
        <div key={station.id} className="station-card">
          <h3>{station.name}</h3>
          <p>{station.address}</p>
        </div>
      ))}
    </div>
  )
}

export default AdminDashboard
