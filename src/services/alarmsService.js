// Simple in-memory mock alarms service (JS)

let nextId = 3;

const PENDING = [
  {
    id: 1,
    title: 'Temperatura fuera de rango: 24.5°C',
    description: 'Temperatura por encima del umbral permitido durante la carga.',
    orderNumber: 'ORD-2024-001',
    at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Temperatura crítica: 26.8°C',
    description: 'Temperatura crítica detectada en la línea de carga.',
    orderNumber: 'ORD-2024-004',
    at: new Date().toISOString()
  }
];

const ACCEPTED = [];

function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getPendingAlarms() {
  await delay(200);
  return JSON.parse(JSON.stringify(PENDING));
}

export async function getAcceptedAlarms() {
  await delay(120);
  return JSON.parse(JSON.stringify(ACCEPTED));
}

export async function acceptAlarm(id, data) {
  await delay(240);
  const idx = PENDING.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Alarma no encontrada');
  const alarm = PENDING.splice(idx, 1)[0];
  const record = {
    ...alarm,
    handledBy: data.user,
    handledAt: new Date().toISOString(),
    observation: data.observation
  };
  ACCEPTED.unshift(record);
  return record;
}

export async function createPendingAlarm(payload) {
  await delay(80);
  const a = {
    id: ++nextId,
    title: payload.title ?? 'Nueva alarma',
    description: payload.description ?? '',
    orderNumber: payload.orderNumber ?? 'ORD-XXXX-XXX',
    at: new Date().toISOString()
  };
  PENDING.push(a);
  return a;
}
