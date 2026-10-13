import { Navigate, Route, Routes } from 'react-router-dom'
import { AlertsProvider } from './alerts/AlertsContext'
import { AlertsList } from './alerts/AlertsList'
import { AuthProvider } from './auth/AuthContext'
import { LoginPage } from './auth/LoginPage'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { DashboardHome } from './dashboard/DashboardHome'
import { AlertDetailPage } from './graph/AlertDetailPage'
import { AppLayout } from './layout/AppLayout'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <AlertsProvider>
                <AppLayout />
              </AlertsProvider>
            }
          >
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/alerts" element={<AlertsList />} />
            <Route path="/alerts/:id" element={<AlertDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
