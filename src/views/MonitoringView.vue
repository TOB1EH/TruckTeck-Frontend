<!-- Vista de Monitoreo principal (tabla con órdenes, filtros y búsqueda) -->
<template>
  <cargo-layout>
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card elevation="6" class="pa-4 monitoring-card">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <h4 class="mb-1">Órdenes de Carga</h4>
              <div class="caption">Administración y monitoreo en tiempo real de las órdenes</div>
            </div>

            <div class="d-flex gap-3 align-center">
              <v-text-field
                v-model="q"
                placeholder="Buscar orden o camión..."
                density="comfortable"
                prepend-inner-icon="mdi-magnify"
                hide-details
              />
              <v-select
                v-model="statusFilter"
                :items="statusOptions"
                dense
                hide-details
                style="max-width: 180px;"
              />
              <v-select
                v-model="sortBy"
                :items="[{label:'Número', value:'number'},{label:'ETA', value:'eta'}]"
                item-title="label"
                item-value="value"
                dense
                hide-details
                style="max-width: 160px;"
              />
            </div>
          </div>

          <orders-table
            :orders="filtered"
            @accept-alarm="acceptAlarm"
          />
        </v-card>
      </v-col>
    </v-row>
  </cargo-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import CargoLayout from '@/layouts/CargoLayout.vue';
import OrdersTable from '@/components/OrdersTable.vue';
import { useOrders } from '@/composables/useOrders.js';
import { acceptAlarm as acceptAlarmService } from '@/services/ordersService.js';

const { orders } = useOrders();

const q = ref('');
const statusFilter = ref('Todos');
const sortBy = ref('number');

const statusOptions = ['Todos', 'LOADING', 'TARA_REGISTERED', 'FINALIZED'];

const filtered = computed(() => {
  let list = orders.value.slice();

  if (q.value) {
    const t = q.value.toLowerCase();
    list = list.filter(o => o.number.toLowerCase().includes(t) || o.truck.toLowerCase().includes(t));
  }
  if (statusFilter.value && statusFilter.value !== 'Todos') {
    list = list.filter(o => o.status === statusFilter.value);
  }

  if (sortBy.value === 'eta') {
    list.sort((a,b) => (a.etaMinutes ?? 9999) - (b.etaMinutes ?? 9999));
  } else {
    list.sort((a,b) => a.number.localeCompare(b.number));
  }

  return list;
});

async function acceptAlarm(payload) {
  await acceptAlarmService(payload.orderId, {
    user: 'operator@example.com',
    observation: payload.observation ?? ''
  });
}
</script>

<style scoped>
.monitoring-card {
  background: rgba(8,16,26,0.6);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.04);
  color: #fff;
}
h4 { color: #fff; margin: 0; }
</style>