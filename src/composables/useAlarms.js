import { ref, onMounted, onUnmounted } from 'vue';
import { getPendingAlarms, getAcceptedAlarms, acceptAlarm as acceptAlarmService, updateAlarmConfig as updateConfigService } from '@/services/alarmsService.js';

// Estado compartido global (singleton)
const pending = ref([]);
const accepted = ref([]);
let pollingInterval = null;

/**
 * Composable para gestionar alarmas del sistema.
 * Provee acceso reactivo a las alarmas pendientes y aceptadas,
 * así como operaciones para cargarlas, aceptarlas y actualizar
 * la configuración de alarmas.
 *
 * @returns {Object} Objeto con estados reactivos y funciones públicas:
 * - pendingAlarms {Ref<Array>}  Lista reactiva de alarmas pendientes.
 * - acceptedAlarms {Ref<Array>} Lista reactiva de alarmas aceptadas.
 * - load {Function}       Carga ambas listas desde el backend.
 * - accept {Function}     Acepta una alarma específica.
 * - updateConfig {Function} Actualiza parámetros de configuración.
 * - startPolling {Function} Inicia verificación automática de alarmas.
 * - stopPolling {Function} Detiene verificación automática.
 */
export function useAlarms() {
  /**
   * Carga todas las alarmas desde el backend.
   * Obtiene las listas de alarmas pendientes y aceptadas.
   *
   * @async
   * @returns {Promise<void>}
   */
  async function load() {
    try {
      console.log('Loading alarms...');
      const [p, a] = await Promise.all([getPendingAlarms(), getAcceptedAlarms()]);
      console.log('Pending alarms:', p);
      console.log('Accepted alarms:', a);
      pending.value = Array.isArray(p) ? p : [];
      accepted.value = Array.isArray(a) ? a : [];
    } catch (e) {
      console.error('Error loading alarms', e);
      pending.value = [];
      accepted.value = [];
    }
  }

  /**
   * Inicia la verificación automática de alarmas cada 30 segundos.
   */
  function startPolling() {
    if (pollingInterval) return; // Ya está corriendo
    
    // Cargar inmediatamente
    load();
    
    // Configurar polling cada 30 segundos
    pollingInterval = setInterval(() => {
      load();
    }, 30000);
  }

  /**
   * Detiene la verificación automática de alarmas.
   */
  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  /**
   * Acepta una alarma específica y recarga las listas.
   *
   * @async
   * @param {number|string} alarmId - ID de la alarma que se desea aceptar.
   * @param {number} userId - ID del usuario que acepta la alarma.
   * @param {string} [observations=''] - Observación opcional registrada.
   * @returns {Promise<{ok: boolean}>} Resultado de la operación.
   * @throws {Error} Si ocurre un error al aceptar la alarma.
   */
  async function accept(alarmId, userId, observations = '') {
    try {
      await acceptAlarmService(alarmId, userId, observations);
      await load(); // Recargar listas después de aceptar
      return { ok: true };
    } catch (error) {
      console.error('Error accepting alarm:', error);
      throw error;
    }
  }

  /**
   * Actualiza la configuración de alarmas del sistema.
   *
   * @async
   * @param {Object} params - Parámetros de configuración.
   * @param {number} params.threshold - Temperatura umbral.
   * @param {Array<string>} params.emails - Lista de emails a notificar.
   * @returns {Promise<{ok: boolean}>} Resultado de la operación.
   * @throws {Error} Si ocurre un error durante la actualización.
   */
  async function updateConfig({ threshold, emails }) {
    try {
      await updateConfigService({ threshold, emails });
      return { ok: true };
    } catch (error) {
      console.error('Error updating alarm config:', error);
      throw error;
    }
  }

  return { 
    pendingAlarms: pending, 
    acceptedAlarms: accepted, 
    load, 
    accept, 
    updateConfig,
    startPolling,
    stopPolling
  };
}
