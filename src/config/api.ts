import axios from 'axios'
import { getIdToken } from 'firebase/auth'
import { auth } from './firebase'
import { API_TIMEOUT_MS } from '../constants/api'

const isDev = import.meta.env.DEV
const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl && !isDev) {
  throw new Error('VITE_API_URL environment variable is required for production builds')
}

// One-time cleanup: remove legacy localStorage token storage (security fix)
try {
  localStorage.removeItem('authToken')
} catch {
  // ignore
}

export const apiClient = axios.create({
  baseURL: isDev ? '/api' : `${apiUrl}/api`,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser
    if (currentUser) {
      try {
        const token = await getIdToken(currentUser)
        config.headers.Authorization = `Bearer ${token}`
      } catch {
        // Token refresh failed — let the request go without auth
        // The 401 handler will redirect if needed
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
      const pathname = window.location.pathname.replace(base, '') || '/'
      const isPublicRoute = pathname === '/' || pathname.startsWith('/signin') || pathname.startsWith('/signup')
      if (!isPublicRoute) {
        window.location.href = `${base}/signin`
      }
    }
    return Promise.reject(error)
  }
)
