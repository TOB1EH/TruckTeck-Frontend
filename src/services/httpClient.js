/**
 * Cliente HTTP para realizar peticiones a la API.
 * Centraliza el manejo de errores y la configuración de headers.
 */

import { API_BASE_URL, API_CONFIG } from '@/config/api.js';

/**
 * Obtiene el token de autenticación del localStorage
 */
function getAuthToken() {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.token;
    }
  } catch (e) {
    console.error('Error al obtener el token:', e);
  }
  return null;
}

/**
 * Construye los headers con autenticación si está disponible
 */
function buildHeaders(customHeaders = {}) {
  const headers = { ...API_CONFIG.headers, ...customHeaders };
  const token = getAuthToken();
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Maneja las respuestas de error de la API
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Error en la petición';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Si no se puede parsear el JSON, usar el status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  // Verificar si la respuesta es JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response;
}

/**
 * Realiza una petición GET
 */
export async function get(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(options.headers),
    ...options,
  });
  
  return handleResponse(response);
}

/**
 * Realiza una petición POST
 */
export async function post(endpoint, data = null, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(options.headers),
    body: data ? JSON.stringify(data) : null,
    ...options,
  });
  
  return handleResponse(response);
}

/**
 * Realiza una petición PUT
 */
export async function put(endpoint, data = null, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: buildHeaders(options.headers),
    body: data ? JSON.stringify(data) : null,
    ...options,
  });
  
  return handleResponse(response);
}

/**
 * Realiza una petición DELETE
 */
export async function del(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: buildHeaders(options.headers),
    ...options,
  });
  
  return handleResponse(response);
}

/**
 * Descarga un archivo desde la API
 */
export async function downloadFile(endpoint, filename) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Error al descargar el archivo');
  }
  
  // Convertir la respuesta a blob
  const blob = await response.blob();
  
  // Crear un enlace temporal para descargar el archivo
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export default {
  get,
  post,
  put,
  delete: del,
  downloadFile,
};
