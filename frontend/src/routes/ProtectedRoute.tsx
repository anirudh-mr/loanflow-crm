import { Navigate } from 'react-router-dom'
import { useAuth, type UserRole } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  // Still loading auth state — show nothing (or a spinner)
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted">Loading…</p>
        </div>
      </div>
    )
  }

  // Not authenticated — go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Role check
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to the dashboard matching their actual role
    const redirectPath = user?.role === 'admin' ? '/admin' : '/staff'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
