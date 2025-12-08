/**
 * Configuración centralizada de la API.
 * Define la URL base del backend y configuraciones comunes.
 */

// URL base del backend - Ajustar según tu entorno
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Configuración por defecto para las peticiones HTTP
 */
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Habilitado - coincide con allowCredentials(true) del backend
};

/**
 * Endpoints de la API organizados por módulo
 * La versión /v1 está incluida en API_BASE_URL
 */
export const API_ENDPOINTS = {
  orders: {
    base: '/orders',
    byNumber: (number) => `/orders/number/${number}`,
    conciliation: (number) => `/orders/number/${number}/conciliation`,
    conciliationPdf: (number) => `/orders/number/${number}/conciliation/pdf`,
  },
  auth: {
    login: '/login',
    // Falta implementar en backend -> logout: '/logout',
  },
  // Sección de catálogos del frontend (no backend)
  catalogs: {
    base: '/catalogs',
  },
  // Endpoints reales por entidad en backend (según Constants.java)
  entities: {
    drivers: '/drivers',
    trucks: '/trucks',
    products: '/products',
    clients: '/clients',
  },
  alarms: {
    base: '/alarms',
  },
};