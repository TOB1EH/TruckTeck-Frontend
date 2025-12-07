// Mock catalog service (JavaScript) - devuelve conductores, camiones, productos y clientes

function delay(ms = 160) {
  return new Promise(r => setTimeout(r, ms));
}

const DRIVERS = [
  { id: 1, name: 'Juan Pérez', license: 'A1234567', phone: '+54 11 1234-5678' },
  { id: 2, name: 'María González', license: 'B7654321', phone: '+54 11 8765-4321' },
  { id: 3, name: 'Carlos Rodríguez', license: 'C9876543', phone: '+54 11 9876-5432' }
];

const TRUCKS = [
  { id: 1, plate: 'CAM-101', capacity: 30000, brand: 'Mercedes-Benz' },
  { id: 2, plate: 'CAM-102', capacity: 28000, brand: 'Scania' },
  { id: 3, plate: 'CAM-103', capacity: 32000, brand: 'Volvo' },
  { id: 4, plate: 'CAM-104', capacity: 25000, brand: 'Iveco' }
];

const PRODUCTS = [
  { id: 1, name: 'Diesel Premium', code: 'PROD-001', type: 'Combustible' },
  { id: 2, name: 'Gasolina Super', code: 'PROD-002', type: 'Combustible' },
  { id: 3, name: 'Nafta Premium', code: 'PROD-003', type: 'Combustible' },
  { id: 4, name: 'Kerosene', code: 'PROD-004', type: 'Combustible' }
];

const CLIENTS = [
  { id: 1, name: 'Estación de Servicio Norte', code: 'CLI-001', address: 'Av. Principal 123' },
  { id: 2, name: 'Distribuidora Central', code: 'CLI-002', address: 'Calle Comercio 456' },
  { id: 3, name: 'Transporte Sur SA', code: 'CLI-003', address: 'Ruta 9 Km 78' }
];

export async function getDrivers() {
  await delay(180);
  return JSON.parse(JSON.stringify(DRIVERS));
}

export async function getTrucks() {
  await delay(140);
  return JSON.parse(JSON.stringify(TRUCKS));
}

export async function getProducts() {
  await delay(140);
  return JSON.parse(JSON.stringify(PRODUCTS));
}

export async function getClients() {
  await delay(120);
  return JSON.parse(JSON.stringify(CLIENTS));
}