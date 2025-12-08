import { ref } from 'vue';
import { getPendingAlarms, getAcceptedAlarms, acceptAlarm as acceptAlarmService } from '@/services/alarmsService.js';

export function useAlarms() {
  const pending = ref([]);
  const accepted = ref([]);

  async function load() {
    try {
      console.log('Loading alarms...');
      const [p, a] = await Promise.all([getPendingAlarms(), getAcceptedAlarms()]);
      console.log('Pending alarms:', p);
      console.log('Accepted alarms:', a);
      pending.value = Array.isArray(p) ? p : [];
      accepted.value = Array.isArray(a) ? a : [];
    } catch (e) {
      console.error('Error loading alarms', e);
      pending.value = [];
      accepted.value = [];
    }
  }

  async function accept(id, { user, observation } = {}) {
    try {
      await acceptAlarmService(id, { user, observation });
      await load(); // Recargar listas después de aceptar
      return { ok: true };
    } catch (error) {
      console.error('Error accepting alarm:', error);
      throw error;
    }
  }

  return { pending, accepted, load, accept };
}
