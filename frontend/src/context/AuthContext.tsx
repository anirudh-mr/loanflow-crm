import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/services/api'
import { User, UserRole } from '@/types'

export type { UserRole } from '@/types'

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isStaff: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

// ----------------------------------------------------------------
// Context
// ----------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ----------------------------------------------------------------
// Provider
// ----------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('access_token')

    if (storedUser && storedToken) {
      try {
        const parsed: User = JSON.parse(storedUser)
        setUser(parsed)
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('access_token')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      // Send JSON credentials to FastAPI /auth/login
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      const { access_token, user: loggedInUser } = response

      // Persist to localStorage
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(loggedInUser))

      setUser(loggedInUser)

      // Navigate based on user role
      if (loggedInUser.role === 'admin') {
        // If on mobile path or mobile screen, allow navigating to /admin-mobile or /admin
        if (window.location.pathname.startsWith('/admin-mobile')) {
          navigate('/admin-mobile')
        } else {
          navigate('/admin')
        }
      } else {
        navigate('/staff')
      }
    },
    [navigate],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }, [navigate])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ----------------------------------------------------------------
// Hook
// ----------------------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
