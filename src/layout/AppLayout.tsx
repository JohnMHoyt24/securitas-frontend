import { NavLink, Outlet } from 'react-router-dom'
import { useAlerts } from '../alerts/AlertsContext'
import { useAuth } from '../auth/AuthContext'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/alerts', label: 'Alerts' },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const { connected } = useAlerts()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-lg font-semibold">Securitas</h1>
            <p className="text-xs text-slate-400">AML &amp; Fraud Ring Tracker</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              {connected ? 'Live' : 'Connecting...'}
            </span>
            <span className="text-sm text-slate-300">
              {user?.username} <span className="text-slate-500">({user?.role})</span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="flex gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `border-b-2 px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-indigo-500 text-slate-100'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
