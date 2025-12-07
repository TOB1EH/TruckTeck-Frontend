<!-- Vista de Monitoreo principal (tabla con órdenes, filtros y búsqueda) -->
 <!-- Vista principal del módulo de monitoreo de órdenes de carga.
  Muestra filtros, buscador y la tabla de órdenes. -->
<template>
  <!-- Layout general de la aplicación -->
  <cargo-layout>
    <v-row class="mb-6">
      <v-col cols="12">
        <!-- Tarjeta principal que contiene buscador, filtros y tabla -->
        <v-card elevation="6" class="pa-4 monitoring-card">
          <!-- Encabezado: título + controles (buscador, filtros, ordenamiento) -->
          <div class="d-flex align-center justify-space-between mb-4">
            <!-- Bloque de títulos -->
            <div>
              <h4 class="mb-1">Órdenes de Carga</h4>
              <div class="caption">Administración y monitoreo en tiempo real de las órdenes</div>
            </div>

            <!-- Controles: búsqueda, filtro de estado y ordenamiento -->
            <div class="d-flex align-center" style="gap: 26px;">
              <!-- Campo de búsqueda por número de orden o camión --> 
              <v-text-field
                v-model="q"
                placeholder="Buscar orden o camión..."
                density="comfortable"
                prepend-inner-icon="mdi-magnify"
                hide-details
                style="width: 240px;"
              />
              <!-- Filtro por estado de la orden -->
              <v-select
                v-model="statusFilter"
                :items="statusOptions"
                dense
                hide-details
                style="max-width: 180px;"
              />
              <!-- Ordenamiento por número de orden o ETA -->
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

          <!-- Tabla de órdenes (componente hijo) -->
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
  /* Importaciones:
   - ref, computed: reactividad
   - CargoLayout: layout visual superior
   - OrdersTable: tabla con cada fila y columnas personalizadas
   - useOrders: composable que expone la lista reactiva de órdenes
   - acceptAlarmService: servicio para aceptar alarmas en backend
*/
import { ref, computed } from 'vue';
import CargoLayout from '@/layouts/CargoLayout.vue';
import OrdersTable from '@/components/OrdersTable.vue';
import { useOrders } from '@/composables/useOrders.js';
import { acceptAlarm as acceptAlarmService } from '@/services/ordersService.js';

/* useOrders devuelve un ref reactivo con las órdenes 
   obtenidas desde API, WebSocket o un poller según implementación */
const { orders } = useOrders();

/* Estado local:
   - q: texto de búsqueda
   - statusFilter: estado para filtrar las órdenes
   - sortBy: criterio de ordenamiento
*/
const q = ref('');
const statusFilter = ref('Todos');
const sortBy = ref('number');

/* Opciones del filtro de estado */
const statusOptions = ['Todos', 'LOADING', 'TARA_REGISTERED', 'FINALIZED'];

/*
  Computed: lista de órdenes filtradas y ordenadas.
  Aplica en este orden:
  1) búsqueda por número o camión
  2) filtrado por estado
  3) ordenamiento por número o ETA
*/
const filtered = computed(() => {
  let list = orders.value.slice();

  // Búsqueda textual
  if (q.value) {
    const t = q.value.toLowerCase();
    list = list.filter(o => o.number.toLowerCase().includes(t) || o.truck.toLowerCase().includes(t));
  }
  // Filtro por estado específico
  if (statusFilter.value && statusFilter.value !== 'Todos') {
    list = list.filter(o => o.status === statusFilter.value);
  }

  // Ordenamiento:
  // - ETA ascendente (nulls últimos)
  // - o número alfabético
  if (sortBy.value === 'eta') {
    list.sort((a,b) => (a.etaMinutes ?? 9999) - (b.etaMinutes ?? 9999));
  } else {
    list.sort((a,b) => a.number.localeCompare(b.number));
  }

  return list;
});

/*
  Función que envía al backend la aceptación de una alarma
  asociada a una orden. El componente OrdersTable emite
  el evento "accept-alarm" y pasa el orderId + observación.
*/
async function acceptAlarm(payload) {
  await acceptAlarmService(payload.orderId, {
    user: 'operator@example.com',
    observation: payload.observation ?? ''
  });
}
</script>

<style scoped>
  /* Tarjeta principal del módulo de monitoreo */
  .monitoring-card {
    background: rgba(8,16,26,0.6);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.04);
    color: #fff;
  }
  h4 { 
    color: #fff; 
    margin: 0;
  }
</style>