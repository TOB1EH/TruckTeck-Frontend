import { ref, computed } from 'vue';
import { login as authLogin, logout as authLogout } from '@/services/authService.js';

const STORAGE_KEY = 'truckteck_user';
const user = ref(null);

/**
 * Carga desde localStorage la información del usuario autenticado.
 * Si la información existe, se parsea y se asigna al estado reactivo `user`.
 * Si ocurre un error o el dato no existe, `user` se establece en null.
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      user.value = JSON.parse(raw);
    }
  } catch (e) {
    user.value = null;
  }
}

/**
 * Persiste en localStorage el estado actual del usuario.
 * Si el usuario existe, se guarda como JSON. Si es null, se elimina la clave.
 */
function saveToStorage() {
  if (user.value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Inicializa el estado cargando posible información previa desde localStorage
loadFromStorage();

/**
 * Composable `useAuth` para gestionar la autenticación en el frontend.
 * Expone el estado del usuario, una bandera computada que indica si está autenticado,
 * y las funciones de login y logout que interactúan con el servicio real de autenticación.
 *
 * @returns {Object} Objeto con propiedades y métodos de autenticación.
 * @property {Ref<Object|null>} user - Estado reactivo que contiene el usuario autenticado y su token.
 * @property {ComputedRef<boolean>} isAuthenticated - Indica si existe un usuario con token válido.
 * @property {Function} doLogin - Realiza la autenticación con credenciales.
 * @property {Function} doLogout - Cierra la sesión del usuario.
 */
export function useAuth() {
  /**
   * Indica si el usuario está autenticado.
   * Se evalúa en función de la presencia de un objeto usuario y su token.
   */
  const isAuthenticated = computed(() => !!(user.value && user.value.token));

  /**
   * Ejecuta el proceso de autenticación contra el backend.
   * Recibe usuario y contraseña, delega en el servicio `authLogin`,
   * almacena el resultado y lo persiste en localStorage.
   *
   * @async
   * @param {string} username - Nombre de usuario.
   * @param {string} password - Contraseña ingresada.
   * @returns {Promise<Object>} El usuario autenticado, incluyendo el token JWT.
   */
  async function doLogin(username, password) {
    const u = await authLogin(username, password);
    user.value = u; // contiene { username, token }
    saveToStorage();
    return user.value;
  }

  /**
   * Ejecuta el proceso de cierre de sesión.
   * Llama al servicio `authLogout`, limpia el estado del usuario
   * y elimina la persistencia en localStorage.
   *
   * @async
   * @returns {Promise<void>}
   */
  async function doLogout() {
    await authLogout();
    user.value = null;
    saveToStorage();
  }

  return {
    user,
    isAuthenticated,
    doLogin,
    doLogout
  };
}
