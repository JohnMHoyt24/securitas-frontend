/**
 * In local dev this is empty, so requests go to relative paths (`/api`, `/ws`) that
 * Vite's dev server proxies to localhost:8080. In production (Render), the static
 * build has no proxy, so VITE_API_BASE_URL must point at the deployed backend
 * (e.g. https://api.securitas-aml.app) and every request becomes a genuine
 * cross-origin call — see SecurityConfig's CORS setup on the backend for that side.
 */
export const API_ORIGIN = import.meta.env.VITE_API_BASE_URL ?? ''
