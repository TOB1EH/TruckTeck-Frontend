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
  credentials: 'include', // Para enviar cookies si es necesario
};

/**
 * Endpoints de la API organizados por módulo
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
  catalogs: {
    base: '/catalogs',
  },
  alarms: {
    base: '/alarms',
  },
};
