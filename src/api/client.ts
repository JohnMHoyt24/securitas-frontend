import axios from 'axios'
import { API_ORIGIN } from './config'

export const apiClient = axios.create({
  baseURL: `${API_ORIGIN}/api`,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('securitas_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
