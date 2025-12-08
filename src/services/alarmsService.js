/**
 * Servicio de alarmas - Backend real
 * Conecta con /api/v1/alarm/list para obtener alarmas
 * y con /api/v1/alarm/reset-email/{id} para aceptarlas
 */

import { get, put } from '@/services/httpClient.js';
import { API_ENDPOINTS } from '@/config/api.js';

/**
 * Mapea una alarma del backend al formato del frontend
 * Backend devuelve en camelCase: alarmState, currentTemperature, eventDateTime, orderNumber, thresholdTemperature
 */
function mapAlarm(a) {
  return {
    id: a.id,
    alarmState: a.alarmState, // true = pendiente, false = aceptada
    currentTemperature: a.currentTemperature,
    eventDateTime: a.eventDateTime,
    orderNumber: a.orderNumber,
    thresholdTemperature: a.thresholdTemperature,
    // Campos derivados para UI
    title: `Temperatura fuera de rango: ${a.currentTemperature}°C`,
    description: `Umbral: ${a.thresholdTemperature}°C`,
  };
}

/**
 * Obtiene todas las alarmas del backend
 */
export async function getAllAlarms() {
  try {
    const list = await get(API_ENDPOINTS.alarms.list);
    console.log('Raw alarms from backend:', list);
    return Array.isArray(list) ? list.map(mapAlarm) : [];
  } catch (error) {
    console.error('Error fetching alarms:', error);
    return [];
  }
}

/**
 * Obtiene alarmas pendientes (alarmState = true)
 */
export async function getPendingAlarms() {
  const all = await getAllAlarms();
  const pending = all.filter(a => a.alarmState === true);
  console.log('Filtered pending alarms:', pending);
  return pending;
}

/**
 * Obtiene alarmas aceptadas (alarmState = false)
 */
export async function getAcceptedAlarms() {
  const all = await getAllAlarms();
  const accepted = all.filter(a => a.alarmState === false);
  console.log('Filtered accepted alarms:', accepted);
  return accepted;
}

/**
 * Acepta una alarma (cambia estado de true a false)
 * PUT /api/v1/alarm/reset-email/{id}
 */
export async function acceptAlarm(id, { user, observation } = {}) {
  try {
    await put(API_ENDPOINTS.alarms.accept(id));
    return { id, ok: true, user, observation };
  } catch (error) {
    console.error('Error accepting alarm:', error);
    throw error;
  }
}
