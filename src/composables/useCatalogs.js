/**
 * Módulo de gestión de catálogos.
 * 
 * Proporciona estados reactivos que contienen listas de:
 * - Conductores
 * - Camiones
 * - Productos
 * - Clientes
 *
 * El módulo centraliza la carga inicial de todos los catálogos mediante
 * un único método asíncrono (`load()`), facilitando su uso desde cualquier
 * componente Vue que requiera estos datos.
 */

import { ref } from 'vue';
import {
  fetchDrivers,
  fetchTrucks,
  fetchProducts,
  fetchClients
} from '@/services/catalogService.js';

/**
 * Lista reactiva de conductores.
 * @type {import('vue').Ref<Array>}
 */
export const drivers = ref([]);

/**
 * Lista reactiva de camiones.
 * @type {import('vue').Ref<Array>}
 */
export const trucks = ref([]);

/**
 * Lista reactiva de productos.
 * @type {import('vue').Ref<Array>}
 */
export const products = ref([]);

/**
 * Lista reactiva de clientes.
 * @type {import('vue').Ref<Array>}
 */
export const clients = ref([]);

/**
 * Hook composable que expone los catálogos y la función para cargarlos.
 *
 * @returns {{
 *   drivers: import('vue').Ref<Array>,
 *   trucks: import('vue').Ref<Array>,
 *   products: import('vue').Ref<Array>,
 *   clients: import('vue').Ref<Array>,
 *   load: Function
 * }}
 *  Objeto que contiene los estados reactivos y el método de carga.
 */
export function useCatalogs() {
  /**
   * Carga todos los catálogos en paralelo mediante `Promise.all`.
   * 
   * En caso de error, se muestra un log en consola y se asignan
   * listas vacías para evitar estados inconsistentes.
   *
   * @returns {Promise<void>}
   */
  async function load() {
    try {
      const [d, t, p, c] = await Promise.all([
        fetchDrivers(),
        fetchTrucks(),
        fetchProducts(),
        fetchClients()
      ]);

      drivers.value = d;
      trucks.value = t;
      products.value = p;
      clients.value = c;
    } catch (e) {
      console.error('Error loading catalogs', e);

      // Restablecer estados para evitar información parcial
      drivers.value = [];
      trucks.value = [];
      products.value = [];
      clients.value = [];
    }
  }

  return { drivers, trucks, products, clients, load };
}
