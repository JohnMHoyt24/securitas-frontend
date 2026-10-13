import { Link, useParams } from 'react-router-dom'
import { useAlerts } from '../alerts/AlertsContext'
import { FraudGraphView } from './FraudGraphView'

export function AlertDetailPage() {
  const { id } = useParams()
  const { alerts } = useAlerts()
  const alert = alerts.find((a) => a.id === Number(id))

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <Link to="/alerts" className="mb-4 inline-block text-sm text-indigo-400 hover:underline">
        &larr; Back to alerts
      </Link>
      {alert ? (
        <FraudGraphView alert={alert} />
      ) : (
        <p className="text-sm text-slate-500">Alert not found (or still loading).</p>
      )}
    </main>
  )
}
