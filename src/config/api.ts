import axios from 'axios'
import { getIdToken } from 'firebase/auth'
import { auth } from './firebase'

const isDev = import.meta.env.DEV

export const apiClient = axios.create({
  baseURL: isDev ? '/api' : 'https://limes-production.up.railway.app/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    let token: string | null = null
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        token = await getIdToken(currentUser)
      }
    } catch {
      // ignore token fetch errors, will fall back to localStorage
    }

    if (!token) {
      token = localStorage.getItem('authToken')
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
      localStorage.removeItem('authToken')
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
