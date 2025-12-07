<!--
  Componente OrdersTable

  Tabla principal para visualizar y monitorear órdenes de carga.
  Muestra diferentes métricas operativas (estado, progreso, preset,
  acumulado, temperatura, densidad, caudal, ETA, tiempo transcurrido)
  con formato personalizado usando slots de Vuetify.

  Recibe un arreglo de órdenes y renderiza una fila por cada una.
-->
<template>
  <v-data-table
    :items="orders"
    class="orders-table"
    hide-default-footer
    :dense="true"
  >
    <!-- template permite que se pueda personalizar cada columna y que no quede en texto plano
    item es la fila con todos los datos de la orden, y se lo recorre columna a columna por cada template -->
    <!-- Número de orden destacado -->
    <template #item.number="{ item }">
      <div class="order-number">{{ item.number }}</div>
    </template>

    <!-- Estado mostrado como chip coloreado según su valor -->
    <template #item.status="{ item }">
      <v-chip :color="statusColor(item.status)" small dark>{{ item.status }}</v-chip>
    </template>

    <!-- Progreso de la carga: barra + porcentaje -->
    <template #item.progress="{ item }">
      <div style="min-width:160px;">
        <v-progress-linear :value="progressPercent(item)" height="10" rounded color="rgba(255,255,255,0.12)"/>
        <div class="caption mt-1">{{ progressPercent(item).toFixed(1) }}%</div>
      </div>
    </template>

    <!-- Preset formateado -->
    <template #item.preset="{ item }">
      {{ item.preset.toLocaleString() }}
    </template>

    <!-- Masa acumulada con redondeo a 3 decimales -->
    <template #item.accumulated="{ item }">
      {{ item.accumulated.toLocaleString(undefined, {maximumFractionDigits:3}) }}
    </template>

    <!-- Última temperatura con icono -->
    <template #item.lastTemp="{ item }">
      <v-icon small class="mr-1" color="orange">mdi-thermometer</v-icon>{{ item.lastTemp }}
    </template>

    <!-- Densidad con icono -->
    <template #item.density="{ item }">
      <v-icon small class="mr-1" color="blue">mdi-water</v-icon>{{ item.density }}
    </template>

    <!-- Caudal con icono y formato -->
    <template #item.flow="{ item }">
      <v-icon small class="mr-1" color="green">mdi-swap-vertical</v-icon>{{ formatFlow(item.flow) }}
    </template>

    <!-- Tiempo estimado de arribo (ETA) en formato legible -->
    <template #item.eta="{ item }">
      <div v-if="item.etaMinutes !== null">{{ humanETA(item.etaMinutes) }}</div>
      <div v-else class="muted">--</div>
    </template>

    <!-- Minutos transcurridos -->
    <template #item.elapsed="{ item }">
      <div v-if="item.elapsedMinutes !== null">{{ Math.floor(item.elapsedMinutes) }}m</div>
      <div v-else class="muted">--</div>
    </template>

    <!-- Mensaje para cuando no hay datos -->
    <template #no-data>
      <v-alert type="info">No hay órdenes que coincidan.</v-alert>
    </template>
  </v-data-table>
</template>

<script setup>
/**
 * Propiedades del componente
 * - orders: lista de órdenes a mostrar en la tabla.
 */
const props = defineProps({ orders: { type: Array, required: true } });

/**
 * Calcula el porcentaje de progreso de una orden.
 * Se asegura de no superar el 100%.
 */
function progressPercent(o) {
  return Math.min(100, (o.accumulated / o.preset) * 100);
}

/**
 * Devuelve un color según el estado de la orden.
 * Se usa en el chip de la columna "status".
 */
function statusColor(s) {
  if (s === 'LOADING') return 'orange darken-2';
  if (s === 'TARA_REGISTERED') return 'blue darken-2';
  if (s === 'FINALIZED') return 'green darken-2';
  return 'grey';
}

/**
 * Formatea el caudal (flow) con hasta dos decimales.
 */
function formatFlow(f) {
  if (!f) return '0';
  return f.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Convierte minutos en un formato más legible:
 * - Menos de 60: “X min”
 * - Más de 60: “Hh Mm”
 */
function humanETA(mins) {
  if (mins == null) return '--';
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = Math.floor(mins/60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}
</script>

<style scoped>
/* Hacer la tabla transparente/oscura */
/* Estilo general en modo oscuro */
.orders-table {
  color: #fff;
  background: transparent !important;
}

/* Fondo oscuro para los elementos de la tabla */
/* Table wrapper transparente */
/* Deep permite aplicar estilos a elementos internos o hijos que Vue adorna originalmente. Es decir,
sin deep no se podrían reemplazar estilos que Vue adorna normalmente. Deep aplica estilos forzadamente a los estilos originales de Vue. */
.orders-table :deep(.v-data-table__wrapper) {
  background: transparent;
}

.orders-table :deep(table) {
  background: transparent;
}

/* Encabezado */
.orders-table :deep(thead) {
  background: rgba(255, 255, 255, 0.05);
}

/* Filas */
.orders-table :deep(tbody tr) {
  background: transparent !important;
}

.orders-table :deep(tbody tr:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

.orders-table :deep(th) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.orders-table :deep(td) {
  color: #fff !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* Número de orden destacado */
.order-number { 
  color: #ffb94d; 
  font-weight: 700; 
}

.muted { 
  color: rgba(255,255,255,0.35) 
}

.caption { 
  color: rgba(255,255,255,0.6) 
}
</style>