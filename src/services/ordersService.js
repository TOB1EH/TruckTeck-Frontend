/**
 * Servicio de Órdenes
 * Conecta con el backend para obtener y gestionar órdenes de carga.
 */

import { get } from '@/services/httpClient.js';
import { API_ENDPOINTS } from '@/config/api.js';

/**
 * Obtiene la lista de todas las órdenes desde el backend.
 * 
 * @returns {Promise<Array>} Lista de órdenes con sus datos completos
 */
export async function getOrders() {
  try {
    const orders = await get(API_ENDPOINTS.orders.base);
    
    console.log(`📦 Órdenes recibidas del backend: ${orders.length}`);
    console.log('📋 Datos completos:', orders);
    
    // Mapear los datos del backend al formato esperado por el frontend
    const mapped = orders.map(order => ({
      id: order.id,
      number: order.number,
      status: order.state || order.status,
      truck: order.truck?.domain || 'N/A',
      preset: order.preset || 0,
      accumulated: order.accumulatedMass || 0,
      lastTemp: order.temperature || 0,
      density: order.density || 0,
      flow: order.caudal || 0,
      // startTime: order.loadStartTime || null,
      // // Campos adicionales que pueden ser útiles
      // client: order.client?.name || order.clientName || 'N/A',
      // driver: order.driver?.name || order.driverName || 'N/A',
      // product: order.product?.name || order.productName || 'N/A'
    }));
    
    console.log(`✅ Órdenes mapeadas: ${mapped.length}`);
    
    return mapped;
  } catch (error) {
    console.error('❌ Error al obtener órdenes:', error);
    throw new Error('No se pudieron cargar las órdenes');
  }
}

/**
 * Obtiene una orden específica por su ID.
 * 
 * @param {number} id - ID de la orden
 * @returns {Promise<Object>} Orden con sus datos completos
 */
export async function getOrderById(id) {
  try {
    const order = await get(`${API_ENDPOINTS.orders.base}/${id}`);
    return order;
  } catch (error) {
    console.error('Error al obtener orden:', error);
    throw new Error(`No se pudo cargar la orden ${id}`);
  }
}

/**
 * Obtiene una orden específica por su número.
 * 
 * @param {string} number - Número de la orden
 * @returns {Promise<Object>} Orden con sus datos completos
 */
export async function getOrderByNumber(number) {
  try {
    const order = await get(API_ENDPOINTS.orders.byNumber(number));
    return order;
  } catch (error) {
    console.error('Error al obtener orden:', error);
    throw new Error(`No se pudo cargar la orden ${number}`);
  }
}

/**
 * Acepta una alarma asociada a una orden (placeholder).
 * TODO: Implementar endpoint en backend si es necesario.
 * 
 * @param {number} orderId - ID de la orden
 * @param {Object} data - Datos de la aceptación (usuario, observación)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function acceptAlarm(orderId, data) {
  // TODO: Implementar cuando exista el endpoint en backend
  console.warn('acceptAlarm no implementado en backend todavía');
  return Promise.resolve({ ok: true });
}

/**
 * Obtiene los detalles de carga de una orden (registros OrderDetail).
 * 
 * @param {number} orderId - ID de la orden
 * @returns {Promise<Array>} Lista de detalles de carga con timestamp, masa, densidad, temperatura y caudal
 */
export async function getOrderDetails(orderId) {
  try {
    const details = await get(`${API_ENDPOINTS.orders.base}/detail/${orderId}`);
    console.log(`Detalles de carga obtenidos: ${details.length} registros`);
    return details;
  } catch (error) {
    console.error('Error al obtener detalles de la orden:', error);
    throw new Error(`No se pudieron cargar los detalles de la orden ${orderId}`);
  }
}
