/* Service mock ordersService (fetch, accept alarm) */

// mock data
const MOCK_ORDERS = [
  {
    id: 1,
    number: 'ORD-2024-001',
    status: 'LOADING',
    truck: 'CAM-101',
    preset: 25000,
    accumulated: 15689.199,
    lastTemp: 17.6,
    density: 0.832,
    flow: 12548.83,
    startTime: new Date(Date.now() - 45*60000).toISOString()
  },
  {
    id: 2,
    number: 'ORD-2024-002',
    status: 'TARA_REGISTERED',
    truck: 'CAM-102',
    preset: 30000,
    accumulated: 0,
    lastTemp: 19.2,
    density: 0.828,
    flow: 0,
    startTime: null
  },
  {
    id: 3,
    number: 'ORD-2024-003',
    status: 'FINALIZED',
    truck: 'CAM-103',
    preset: 28000,
    accumulated: 28000,
    lastTemp: 17.8,
    density: 0.835,
    flow: 0,
    startTime: new Date(Date.now() - 120*60000).toISOString()
  },
  {
    id: 4,
    number: 'ORD-2024-004',
    status: 'LOADING',
    truck: 'CAM-104',
    preset: 22000,
    accumulated: 9161.967,
    lastTemp: 18.9,
    density: 0.83,
    flow: 11840.805,
    startTime: new Date(Date.now() - 30*60000).toISOString()
  }
];

const ALARM_LOG = [];

export async function getOrders() {
  await new Promise(r => setTimeout(r, 200));
  return JSON.parse(JSON.stringify(MOCK_ORDERS));
}

export async function acceptAlarm(orderId, data) {
  ALARM_LOG.push({ orderId, user: data.user, at: new Date().toISOString(), observation: data.observation });
  return { ok: true };
}

export function getAlarmLog() {
  return ALARM_LOG.slice();
}
