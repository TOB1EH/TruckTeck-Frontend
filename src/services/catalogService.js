/**
 * Servicio de catálogos para conductores, camiones, productos y clientes.
 * 
 * Centraliza las operaciones CRUD básicas contra la API utilizando el httpClient.
 * 
 * Nota: En las operaciones de actualización (update*) se debe conservar `externalCode`,
 * debido a que el backend espera un objeto completo en las solicitudes PUT.
 */

import { get, post, put } from '@/services/httpClient.js';
import { API_ENDPOINTS } from '@/config/api.js';

/* -------------------------------------------------------------------------- */
/*                               DRIVERS SERVICE                               */
/* -------------------------------------------------------------------------- */

/**
 * Obtiene la lista de conductores desde el backend y normaliza los datos.
 *
 * @returns {Promise<Array>} Lista normalizada de conductores.
 */
export async function fetchDrivers() {
  const list = await get(API_ENDPOINTS.entities.drivers);
  return list.map(d => ({
    id: d.id,
    fullName: [d.name, d.surname].filter(Boolean).join(' '),
    documentNumber: d.documentNumber ?? '--',
    externalCode: d.externalCode ?? '--',
  }));
}

/**
 * Crea un nuevo conductor.
 *
 * @param {Object} payload - Datos del conductor a crear.
 * @returns {Promise<void>}
 */
export async function createDriver(payload) {
  await post(API_ENDPOINTS.entities.drivers, payload);
}

/**
 * Actualiza un conductor existente.
 * IMPORTANTE: El backend requiere un objeto completo, incluyendo `externalCode`.
 *
 * @param {Object} payload - Datos completos del conductor.
 * @returns {Promise<void>}
 */
export async function updateDriver(payload) {
  await put(API_ENDPOINTS.entities.drivers, payload);
}

/* -------------------------------------------------------------------------- */
/*                                TRUCKS SERVICE                               */
/* -------------------------------------------------------------------------- */

/**
 * Obtiene la lista de camiones desde el backend y normaliza los datos.
 *
 * @returns {Promise<Array>} Lista normalizada de camiones.
 */
export async function fetchTrucks() {
  const list = await get(API_ENDPOINTS.entities.trucks);
  return list.map(t => ({
    id: t.id,
    domain: t.domain ?? '--',
    description: t.description ?? '--',
    cisterns: Array.isArray(t.cisterns) ? t.cisterns : [],
    externalCode: t.externalCode ?? '--',
  }));
}

/**
 * Crea un nuevo camión.
 *
 * @param {Object} payload - Información del camión.
 * @returns {Promise<void>}
 */
export async function createTruck(payload) {
  await post(API_ENDPOINTS.entities.trucks, payload);
}

/**
 * Actualiza un camión existente.
 *
 * @param {Object} payload - Datos completos del camión.
 * @returns {Promise<void>}
 */
export async function updateTruck(payload) {
  await put(API_ENDPOINTS.entities.trucks, payload);
}

/* -------------------------------------------------------------------------- */
/*                               PRODUCTS SERVICE                              */
/* -------------------------------------------------------------------------- */

/**
 * Obtiene la lista de productos desde el backend y normaliza los datos.
 *
 * @returns {Promise<Array>} Lista normalizada de productos.
 */
export async function fetchProducts() {
  const list = await get(API_ENDPOINTS.entities.products);
  return list.map(p => ({
    id: p.id,
    name: p.name ?? '--',
    description: p.description ?? '--',
    externalCode: p.externalCode ?? '--',
  }));
}

/**
 * Crea un nuevo producto.
 *
 * @param {Object} payload - Datos del producto a crear.
 * @returns {Promise<void>}
 */
export async function createProduct(payload) {
  await post(API_ENDPOINTS.entities.products, payload);
}

/**
 * Actualiza un producto existente.
 *
 * @param {Object} payload - Datos completos del producto.
 * @returns {Promise<void>}
 */
export async function updateProduct(payload) {
  await put(API_ENDPOINTS.entities.products, payload);
}

/* -------------------------------------------------------------------------- */
/*                                CLIENTS SERVICE                              */
/* -------------------------------------------------------------------------- */

/**
 * Obtiene la lista de clientes desde el backend y normaliza los datos.
 *
 * @returns {Promise<Array>} Lista normalizada de clientes.
 */
export async function fetchClients() {
  const list = await get(API_ENDPOINTS.entities.clients);
  return list.map(c => ({
    id: c.id,
    companyName: c.companyName ?? '--',
    contactName: c.contactName ?? '--',
    externalCode: c.externalCode ?? '--',
  }));
}

/**
 * Crea un nuevo cliente.
 *
 * @param {Object} payload - Datos del cliente a crear.
 * @returns {Promise<void>}
 */
export async function createClient(payload) {
  await post(API_ENDPOINTS.entities.clients, payload);
}

/**
 * Actualiza un cliente existente.
 *
 * @param {Object} payload - Datos completos del cliente.
 * @returns {Promise<void>}
 */
export async function updateClient(payload) {
  await put(API_ENDPOINTS.entities.clients, payload);
}
