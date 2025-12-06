import { ref } from 'vue';
import { getPendingAlarms, getAcceptedAlarms } from '@/services/alarmsService.js';

const pending = ref([]);
const accepted = ref([]);

export function useAlarms() {
  async function load() {
    try {
      const p = await getPendingAlarms();
      const a = await getAcceptedAlarms();
      pending.value = p;
      accepted.value = a;
    } catch (e) {
      console.error('Error loading alarms', e);
      pending.value = [];
      accepted.value = [];
    }
  }

  return { pending, accepted, load };
}
