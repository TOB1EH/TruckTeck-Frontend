import { ref, computed } from 'vue';
import { getOrders as fetchOrders } from '@/services/ordersService.js';

const orders = ref([]);

function computeETAMinutes(o) {
  if (!o.flow || o.flow <= 0) return null;
  const remaining = Math.max(0, o.preset - o.accumulated);
  return (remaining / o.flow) * 60;
}

function computeElapsedMinutes(o) {
  if (!o.startTime || o.status !== 'LOADING') return null;
  const diffMs = Date.now() - new Date(o.startTime).getTime();
  return diffMs / 1000 / 60;
}

export function useOrders() {
  async function load() {
    const data = await fetchOrders();
    orders.value = data.map(o => ({
      ...o,
      etaMinutes: computeETAMinutes(o),
      elapsedMinutes: computeElapsedMinutes(o)
    }));
  }

  setInterval(() => {
    orders.value = orders.value.map(o => {
      const flow = o.flow ? Math.max(0, o.flow + (Math.random() - 0.5) * 2) : o.flow;
      const lastTemp = o.lastTemp ? +(o.lastTemp + (Math.random() - 0.5) * 0.4).toFixed(1) : o.lastTemp;
      const accumulated = o.status === 'LOADING' ? Math.min(o.preset, o.accumulated + (flow/60)*5) : o.accumulated;
      return {
        ...o,
        flow,
        lastTemp,
        accumulated,
        etaMinutes: flow ? (Math.max(0, o.preset - accumulated) / flow) * 60 : null,
        elapsedMinutes: o.status === 'LOADING' && o.startTime ? (Date.now() - new Date(o.startTime).getTime())/1000/60 : null
      };
    });
  }, 5000);

  load();

  return { orders };
}
