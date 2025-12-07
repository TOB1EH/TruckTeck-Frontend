<template>
  <!--
  VISTA DE CATÁLOGO DE ENTIDADES
  --------------------------------
  Esta pantalla permite administrar los distintos catálogos del sistema:
  conductores, camiones, productos y clientes.
  El layout principal (<cargo-layout>) envuelve la vista completa,
  asegurando que el encabezado, navegación y fondo global permanezcan constantes.
  -->
  <cargo-layout>
    <v-container>
      <!-- Título general de la vista -->
      <h2 class="mb-4">Catálogo de Entidades</h2>

      <!--
        TARJETA SUPERIOR: Selección de entidad a visualizar
        ---------------------------------------------------
        Muestra la descripción del módulo y los botones tipo "segment"
        para alternar entre cada tipo de catálogo disponible.
      -->
      <v-card class="pa-4 mb-6 monitoring-card" elevation="6">
        <div class="d-flex align-center justify-space-between mb-4">

          <!-- Encabezado e información del módulo -->
          <div>
            <h4 class="mb-1">Catálogo de Entidades</h4>
            <div class="caption">Administración de conductores, camiones, productos y clientes.</div>
          </div>

          <!--
            Grupo de botones de selección (tabs)
            Cada botón activa uno de los catálogos:
            - drivers
            - trucks
            - products
            - clients
          -->
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

      </v-card>

      <!--
        TABLA PRINCIPAL DEL CATÁLOGO
        -----------------------------
        Muestra las filas asociadas a la entidad seleccionada.
        Utiliza <v-data-table> con encabezados y filas calculadas dinámicamente.
      -->
      <v-card class="pa-4 monitoring-card" elevation="6">
        <v-data-table
          :items="currentItems"
          :headers="currentHeaders"
          hide-default-footer
          dense
          class="catalog-table"
        >
          <!-- Columnas con formato específico -->
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
/*
  LÓGICA DE LA VISTA DE CATÁLOGO
  -------------------------------
  Gestiona:
  • Carga inicial de los datos (useCatalogs)
  • Cambios de pestaña (drivers, trucks, products, clients)
  • Construcción dinámica de headers y filas según la entidad seleccionada
*/
import { ref, computed, onMounted } from 'vue';
import CargoLayout from '@/layouts/CargoLayout.vue';
import { useCatalogs } from '@/composables/useCatalogs.js';

/*
  Definición de pestañas:
  Cada objeto define:
  - key: nombre interno
  - label: texto mostrado
  - icon: ícono Vuetify
  - color: color activo del botón
*/
const tabs = [
  { key: 'drivers', label: 'Conductores', icon: 'mdi-account', color: 'green' },
  { key: 'trucks', label: 'Camiones', icon: 'mdi-truck', color: 'blue' },
  { key: 'products', label: 'Productos', icon: 'mdi-cube', color: 'purple' },
  { key: 'clients', label: 'Clientes', icon: 'mdi-domain', color: 'orange' },
];

/* Pestaña seleccionada por defecto */
const selected = ref('drivers');


/*
  Composable useCatalogs:
  Provee listas reactivas y método 'load' para traer datos desde la API.
*/
const { drivers, trucks, products, clients, load } = useCatalogs();

/* Carga inicial de datos al montar la vista */
onMounted(() => {
  load();
});

/*
  Cambiar pestaña seleccionada
*/
function selectTab(k) {
  selected.value = k;
}


/*
  ITEMS ACTUALES
  --------------
  Devuelve la lista correspondiente a la pestaña activa.
*/
const currentItems = computed(() => {
  if (selected.value === 'drivers') return drivers.value;
  if (selected.value === 'trucks') return trucks.value;
  if (selected.value === 'products') return products.value;
  return clients.value;
});

/*
  HEADERS DINÁMICOS DE LA TABLA
  ------------------------------
  Según la entidad seleccionada, construye las columnas a mostrar.
*/
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

/*
  Formato numérico con separadores
*/
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


/* Botones de selección de pestaña */
.tab-btn {
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.8);
  border-radius: 999px;
  text-transform: none;
}

.tab-btn.active { color: white !important; }

.accent { color: #ffb94d; font-weight: 700; }

.chip-purple { background: #9b51e0; color: #fff; font-weight: 600; }

/*
  ESTILO DE TABLA OSCURA
  -----------------------
  Se utiliza transparencia y bordes claros para integrar la tabla
  con el estilo general del dashboard.
*/
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