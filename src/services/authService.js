// Auth service real (usa httpClient y API_ENDPOINTS).
// Implementa la autenticación contra el backend Spring, el cual expone
// POST /api/v1/login que retorna un token JWT como text/plain.

import http from '@/services/httpClient.js';
import { API_ENDPOINTS } from '@/config/api.js';

const STORAGE_KEY = 'truckteck_user';

/**
 * Persiste los datos del usuario autenticado en localStorage.
 *
 * @param {Object} user - Objeto que contiene al menos { username, token }.
 */
function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/**
 * Elimina del almacenamiento local los datos del usuario autenticado.
 */
function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Interpreta mensajes de error provenientes del backend o del httpClient
 * y los normaliza a un mensaje entendible por el usuario final.
 *
 * Utiliza heurísticas para detectar casos típicos:
 * - Credenciales inválidas (mensajes de Spring Security y backend).
 * - Errores 401 sin mensaje explícito.
 * - Errores internos (500, fallas de red, etc.).
 *
 * @param {Error|Object} err - Error recibido, posiblemente con `message` y `status`.
 * @returns {string} Mensaje de error legible para el usuario.
 */
function normalizeAuthError(err) {
  const msg = (err?.message || '').toLowerCase();

  // Coincidencias comunes en autenticación fallida
  if (
    msg.includes('bad credentials') ||
    msg.includes('invalid credentials') ||
    msg.includes('credenciales inválidas') ||
    msg.includes('contraseña') ||
    msg.includes('password')
  ) {
    return 'Usuario o contraseña incorrectos';
  }

  // 401 sin mensaje útil → credenciales inválidas
  if (err?.status === 401) {
    return 'Usuario o contraseña incorrectos';
  }

  // Resto de errores → fallo interno
  return 'Error interno de autenticación. Intenta nuevamente.';
}

/**
 * Ejecuta el proceso de login contra el backend.
 *
 * El backend (Spring Boot) espera que `username` y `password`
 * se envíen como parámetros en query string.
 *
 * Respuesta esperada: text/plain → token JWT.
 *
 * @async
 * @param {string} username - Nombre de usuario ingresado en la UI.
 * @param {string} password - Contraseña asociada al usuario.
 * @returns {Promise<Object>} Objeto con { username, token }.
 * @throws {Error} Si el backend rechaza credenciales o el token es inválido.
 */
export async function login(username, password) {
  if (!username || !password) {
    throw new Error('Usuario o contraseña inválidos');
  }

  const endpoint = `${API_ENDPOINTS.auth.login}?username=${encodeURIComponent(
    username
  )}&password=${encodeURIComponent(password)}`;

  try {
    // El backend solo necesita POST sin body, usando params en la URL.
    const response = await http.post(endpoint, null);

    // Extraer token desde la respuesta (que puede ser string o Response)
    const token =
      typeof response === 'string' ? response : await response.text();

    if (!token || token.length < 10) {
      throw new Error('Token inválido recibido del servidor');
    }

    const user = { username, token };
    saveUser(user);
    return user;
  } catch (err) {
    // Normalización del mensaje de error para UI
    const message = normalizeAuthError(err);
    const e = new Error(message);
    e.status = err?.status;
    throw e;
  }
}

/**
 * Ejecuta el proceso de logout eliminando la sesión almacenada
 * en localStorage.
 *
 * @returns {Promise<{ok: boolean}>} Confirmación del proceso de cierre.
 */
export function logout() {
  clearUser();
  return Promise.resolve({ ok: true });
}

/**
 * Indica si existe un usuario autenticado en el almacenamiento local.
 * Revisa la presencia de un token válido dentro de STORAGE_KEY.
 *
 * @returns {boolean} true si existe usuario con token, false en caso contrario.
 */
export function isAuthenticated() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return !!data?.token;
  } catch (e) {
    return false;
  }
}
