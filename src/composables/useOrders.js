import { ref } from 'vue';
import { getOrders as fetchOrders } from '@/services/ordersService.js';

const orders = ref([]);
let refreshInterval = null;

/**
 * Composable para gestionar el estado de las órdenes de carga.
 * Carga datos del backend y refresca periódicamente cada 10 segundos.
 */
export function useOrders() {
  /**
   * Carga las órdenes desde el backend.
   */
  async function load() {
    try {
      const data = await fetchOrders();
      orders.value = data;
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    }
  }

  /**
   * Inicia el refresco automático de órdenes cada 10 segundos.
   */
  function startAutoRefresh() {
    if (refreshInterval) return; // Ya está corriendo
    
    refreshInterval = setInterval(async () => {
      await load();
    }, 10000); // 10 segundos según FREQUENCY del backend
  }

  /**
   * Detiene el refresco automático.
   */
  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  // Carga inicial y activar refresco automático
  load();
  startAutoRefresh();

  return { 
    orders,
    load,
    startAutoRefresh,
    stopAutoRefresh
  };
}
