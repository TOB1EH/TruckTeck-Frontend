/**
 * Módulo HTTP genérico para interactuar con la API.
 * Gestiona configuración de headers, token de autenticación,
 * manejo centralizado de errores y métodos HTTP estándar.
 */

import { API_BASE_URL, API_CONFIG } from '@/config/api.js';

const STORAGE_KEY = 'truckteck_user';

/**
 * Obtiene el token almacenado en localStorage.
 *
 * @returns {string|null} Token JWT del usuario autenticado o null si no existe.
 */
function getAuthToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const userData = JSON.parse(raw);
      return userData.token;
    }
  } catch (e) {
    console.error('Error al obtener el token:', e);
  }
  return null;
}

/**
 * Construye los headers para una petición HTTP,
 * incorporando headers globales, personalizados y el token JWT si está disponible.
 *
 * @param {Object} [customHeaders={}] Headers adicionales enviados por el llamante.
 * @returns {Object} Headers finales a utilizar en la petición.
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
 * Procesa la respuesta de un `fetch`, extrayendo mensajes de error estandarizados.
 * Devuelve el cuerpo JSON si corresponde.
 *
 * @param {Response} response Objeto Response de `fetch`.
 * @returns {Promise<any>} Datos procesados o error formateado.
 * @throws {Error} Error con mensaje y status HTTP.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Error en la petición';
    let status = response.status;

    try {
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();

        errorMessage =
          errorData.message ||
          errorData.error ||
          errorData.detail ||
          errorMessage;
      } else {
        errorMessage =
          (await response.text()) ||
          response.statusText ||
          errorMessage;
      }
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }

    const err = new Error(errorMessage);
    err.status = status;
    throw err;
  }

  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response;
}

/**
 * Realiza una petición HTTP GET.
 *
 * @param {string} endpoint Endpoint de la API.
 * @param {Object} [options={}] Configuración adicional de la petición.
 * @returns {Promise<any>} Respuesta procesada.
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
 * Realiza una petición HTTP POST.
 *
 * @param {string} endpoint Endpoint de la API.
 * @param {any} [data=null] Cuerpo a enviar.
 * @param {Object} [options={}] Configuración adicional, incluyendo rawBody.
 * @returns {Promise<any>} Respuesta procesada.
 */
export async function post(endpoint, data = null, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const body = data ? (options.rawBody ? data : JSON.stringify(data)) : null;
  const headers = buildHeaders(options.headers);

  // Si se envía rawBody, remover Content-Type JSON
  if (options.rawBody && headers['Content-Type'] === 'application/json') {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
    ...options,
  });

  return handleResponse(response);
}

/**
 * Realiza una petición HTTP PUT.
 *
 * @param {string} endpoint Endpoint de la API.
 * @param {any} [data=null] Datos a actualizar.
 * @param {Object} [options={}] Configuración adicional.
 * @returns {Promise<any>} Respuesta procesada.
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
 * Realiza una petición HTTP DELETE.
 *
 * @param {string} endpoint Endpoint de la API.
 * @param {Object} [options={}] Configuración adicional.
 * @returns {Promise<any>} Respuesta procesada.
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
 * Descarga un archivo desde la API y fuerza su descarga local.
 *
 * @param {string} endpoint Endpoint del archivo.
 * @param {string} filename Nombre con el que se descargará el archivo.
 * @returns {Promise<void>}
 * @throws {Error} Si la descarga falla.
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

  const blob = await response.blob();
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
