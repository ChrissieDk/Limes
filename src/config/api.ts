import axios from 'axios'
import { getIdToken } from 'firebase/auth'
import { auth } from './firebase'

export const apiClient = axios.create({
  baseURL: 'https://limes-develop.onrender.com/api',
  timeout: 10000,
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
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)
