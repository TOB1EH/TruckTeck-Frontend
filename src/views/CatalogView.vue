<template>
  <cargo-layout>
    <v-container>
      <h2 class="mb-4">Catálogo de Entidades</h2>

      <v-card class="pa-4 mb-6 monitoring-card" elevation="6">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h4 class="mb-1">Catálogo de Entidades</h4>
            <div class="caption">Administración de conductores, camiones, productos y clientes.</div>
          </div>

          <div class="d-flex gap-3 align-center">
            <!-- Segment buttons -->
            <v-btn
              v-for="t in tabs"
              :key="t.key"
              :class="['tab-btn', { 'active': selected === t.key }]"
              :color="selected === t.key ? t.color : undefined"
              rounded
              depressed
              @click="selectTab(t.key)"
            >
              <v-icon left small>{{ t.icon }}</v-icon>
              {{ t.label }}
            </v-btn>
          </div>
        </div>

        <div class="mt-3 muted small">GET /api/v1/catalog/{entity}</div>
      </v-card>

      <v-card class="pa-4 monitoring-card" elevation="6">
        <v-data-table
          :items="currentItems"
          :headers="currentHeaders"
          hide-default-footer
          dense
          class="catalog-table"
        >
          <template #item.license="{ item }">
            <div class="accent">{{ item.license }}</div>
          </template>

          <template #item.capacity="{ item }">
            <div class="accent">{{ formatNumber(item.capacity) }}</div>
          </template>

          <template #item.code="{ item }">
            <div class="accent">{{ item.code }}</div>
          </template>

          <template #item.type="{ item }">
            <v-chip small class="chip-purple">{{ item.type }}</v-chip>
          </template>

          <template #item.address="{ item }">
            <div class="muted">{{ item.address }}</div>
          </template>

          <template #no-data>
            <v-alert type="info">No hay elementos para mostrar.</v-alert>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </cargo-layout>
</template>

<script setup>
// Vista de catálogo (JavaScript)
import { ref, computed, onMounted } from 'vue';
import CargoLayout from '@/layouts/CargoLayout.vue';
import { useCatalogs } from '@/composables/useCatalogs.js';

const tabs = [
  { key: 'drivers', label: 'Conductores', icon: 'mdi-account', color: 'green' },
  { key: 'trucks', label: 'Camiones', icon: 'mdi-truck', color: 'blue' },
  { key: 'products', label: 'Productos', icon: 'mdi-cube', color: 'purple' },
  { key: 'clients', label: 'Clientes', icon: 'mdi-domain', color: 'orange' },
];

const selected = ref('drivers');

const { drivers, trucks, products, clients, load } = useCatalogs();

onMounted(() => {
  load();
});

function selectTab(k) {
  selected.value = k;
}

const currentItems = computed(() => {
  if (selected.value === 'drivers') return drivers.value;
  if (selected.value === 'trucks') return trucks.value;
  if (selected.value === 'products') return products.value;
  return clients.value;
});

const currentHeaders = computed(() => {
  if (selected.value === 'drivers') {
    return [
      { title: 'ID', key: 'id' },
      { title: 'Nombre', key: 'name' },
      { title: 'Licencia', key: 'license' },
      { title: 'Teléfono', key: 'phone' },
    ];
  }
  if (selected.value === 'trucks') {
    return [
      { title: 'ID', key: 'id' },
      { title: 'Placa', key: 'plate' },
      { title: 'Capacidad (kg)', key: 'capacity' },
      { title: 'Marca', key: 'brand' },
    ];
  }
  if (selected.value === 'products') {
    return [
      { title: 'ID', key: 'id' },
      { title: 'Nombre', key: 'name' },
      { title: 'Código', key: 'code' },
      { title: 'Tipo', key: 'type' },
    ];
  }
  // clients
  return [
    { title: 'ID', key: 'id' },
    { title: 'Nombre', key: 'name' },
    { title: 'Código', key: 'code' },
    { title: 'Dirección', key: 'address' },
  ];
});

function formatNumber(n) {
  if (n == null) return '--';
  return n.toLocaleString();
}
</script>

<style scoped>
h2 { color: #fff; }
.monitoring-card { 
  background: rgba(8,16,26,0.6); 
  color: #fff; 
  border-radius: 12px; 
  border: 1px solid rgba(255,255,255,0.04); 
}
.caption { color: rgba(255,255,255,0.65); }
.muted { color: rgba(255,255,255,0.45); }
.tab-btn {
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.8);
  border-radius: 999px;
  text-transform: none;
}
.tab-btn.active { color: white !important; }
.accent { color: #ffb94d; font-weight: 700; }
.chip-purple { background: #9b51e0; color: #fff; font-weight: 600; }

/* Estilos para hacer la tabla oscura/transparente */
.catalog-table {
  background: transparent !important;
}

.catalog-table :deep(.v-data-table__wrapper) {
  background: transparent;
}

.catalog-table :deep(table) {
  background: transparent;
}

.catalog-table :deep(thead) {
  background: rgba(255, 255, 255, 0.05);
}

.catalog-table :deep(tbody tr) {
  background: transparent !important;
}

.catalog-table :deep(tbody tr:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

.catalog-table :deep(th) {
  color: rgba(255,255,255,0.7) !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.catalog-table :deep(td) {
  color: rgba(255,255,255,0.9) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>