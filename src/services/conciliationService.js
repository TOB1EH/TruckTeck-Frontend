/**
 * Servicio de Conciliación
 * Conecta con el backend para obtener datos de conciliación de órdenes finalizadas.
 */

import { get, downloadFile } from '@/services/httpClient.js';
import { API_ENDPOINTS } from '@/config/api.js';

/**
 * Obtiene la lista de órdenes finalizadas disponibles para conciliación.
 * 
 * @returns {Promise<Array>} Lista de órdenes con formato { number, label, truck }
 */
export async function getFinalizedOrders() {
  try {
    // Obtener todas las órdenes
    const orders = await get(`${API_ENDPOINTS.orders.base}`);
    
    // Filtrar solo las órdenes con estado FINALIZED
    const finalizedOrders = orders.filter(order => 
      order.status === 'FINALIZED' || order.state === 'FINALIZED'
    );
    
    // Transformar al formato esperado por el frontend
    return finalizedOrders.map(order => ({
      number: order.number,
      truck: order.truck?.plate || order.truckPlate || 'N/A',
      label: `${order.number}`
    }));
  } catch (error) {
    console.error('Error al obtener órdenes finalizadas:', error);
    throw new Error('No se pudieron cargar las órdenes finalizadas');
  }
}

/**
 * Obtiene los datos de conciliación de una orden específica.
 * 
 * @param {string} number - Número de la orden
 * @returns {Promise<Object>} Objeto con los datos de conciliación
 */
export async function getConciliation(number) {
  try {
    const conciliation = await get(API_ENDPOINTS.orders.conciliation(number));
    
    // Mapear los campos del backend a los esperados por el frontend
    return {
      number: conciliation.number,
      truck: conciliation.truck || conciliation.truckPlate,
      presetKg: parseFloat((conciliation.initialWeight || 0).toFixed(3)),
      finalKg: parseFloat((conciliation.finalWeight || 0).toFixed(3)),
      accumulatedMassKg: parseFloat((conciliation.accumulatedMass || 0).toFixed(3)),
      netKg: parseFloat((conciliation.netWeight || 0).toFixed(3)),
      differenceKg: parseFloat((conciliation.differenceWeight || 0).toFixed(3)),
      temperatureC: parseFloat((conciliation.averageTemperature || 0).toFixed(3)),
      density: parseFloat((conciliation.averageDensity || 0).toFixed(3)),
      avgFlowKgPerHour: parseFloat((conciliation.averageCaudal || 0).toFixed(3))
    };
  } catch (error) {
    console.error('Error al obtener conciliación:', error);
    throw new Error(`No se pudo obtener la conciliación de la orden ${number}`);
  }
}

/**
 * Descarga el PDF de conciliación de una orden.
 * 
 * @param {string} number - Número de la orden
 * @returns {Promise<void>}
 */
export async function downloadConciliationPdf(number) {
  try {
    const filename = `Conciliacion_${number}.pdf`;
    await downloadFile(API_ENDPOINTS.orders.conciliationPdf(number), filename);
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    throw new Error(`No se pudo descargar el PDF de la orden ${number}`);
  }
}
