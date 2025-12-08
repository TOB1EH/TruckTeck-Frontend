<!--
  Componente OrdersTable

  Tabla principal para visualizar y monitorear órdenes de carga.
  Muestra diferentes métricas operativas (estado, progreso, preset,
  acumulado, temperatura, densidad, caudal, ETA, tiempo transcurrido)
  con formato personalizado usando slots de Vuetify.

  Recibe un arreglo de órdenes y renderiza una fila por cada una.
-->
<template>
  <div>
    <v-data-table
      :items="orders"
      :headers="headers"
      class="orders-table"
      :items-per-page="10"
      :dense="true"
      @click:row="openOrderDetails"
      hover
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
      {{ (item.preset || 0).toLocaleString() }}
    </template>

    <!-- Masa acumulada con redondeo a 3 decimales -->
    <template #item.accumulated="{ item }">
      {{ (item.accumulated || 0).toLocaleString(undefined, {maximumFractionDigits:3}) }}
    </template>

    <!-- Última temperatura con icono -->
    <template #item.lastTemp="{ item }">
      <v-icon small class="mr-1" color="orange">mdi-thermometer</v-icon>{{ item.lastTemp || 0 }}
    </template>

    <!-- Densidad con icono -->
    <template #item.density="{ item }">
      <v-icon small class="mr-1" color="blue">mdi-water</v-icon>{{ item.density || 0 }}
    </template>

    <!-- Caudal con icono y formato -->
    <template #item.flow="{ item }">
      <v-icon small class="mr-1" color="green">mdi-swap-vertical</v-icon>{{ formatFlow(item.flow) }}
    </template>

    <!-- Mensaje para cuando no hay datos -->
    <template #no-data>
      <v-alert type="info">No hay órdenes que coincidan.</v-alert>
    </template>
  </v-data-table>

  <!-- Dialog con detalles de la orden -->
  <v-dialog v-model="detailsDialog" max-width="1400px">
    <v-card class="order-details-card">
      <!-- Header con número de orden y estado -->
      <v-card-title class="d-flex justify-space-between align-center px-6 py-4">
        <div class="d-flex align-center" style="gap: 12px;">
          <span class="order-title">Orden {{ selectedOrder?.number }}</span>
          <v-chip 
            v-if="selectedOrder"
            :color="statusColor(selectedOrder.state || selectedOrder.status)" 
            label
            size="default"
            class="font-weight-bold text-white"
          >
            {{ selectedOrder.state || selectedOrder.status }}
          </v-chip>
        </div>
        <v-btn icon @click="detailsDialog = false" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider class="border-opacity-10"></v-divider>
      
      <v-card-text v-if="selectedOrder" class="px-6 py-6">
        <!-- Indicador de carga -->
        <div v-if="loadingDetails" class="text-center py-8">
          <v-progress-circular indeterminate color="orange"></v-progress-circular>
          <div class="mt-3">Cargando detalles...</div>
        </div>

        <!-- Sección superior: Información general en grid de 4 columnas -->
        <v-row v-else class="mb-4">
          <v-col cols="12" md="3">
            <div class="detail-box">
              <v-icon small class="detail-icon" color="blue">mdi-truck</v-icon>
              <div class="detail-label">Camión</div>
              <div class="detail-value">{{ selectedOrder.truck?.domain || 'N/A' }}</div>
              <div class="detail-sublabel">Capacidad: {{ selectedOrder.truck?.cisterns.toLocaleString() || 'N/A' }} kg</div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="detail-box">
              <v-icon small class="detail-icon" color="purple">mdi-account</v-icon>
              <div class="detail-label">Conductor</div>
              <div class="detail-value">{{ selectedOrder.driver?.name || 'N/A' }}</div>
              <div class="detail-sublabel">DNI: {{ selectedOrder.driver?.documentNumber || 'N/A' }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="detail-box">
              <v-icon small class="detail-icon" color="pink">mdi-gas-station</v-icon>
              <div class="detail-label">Producto</div>
              <div class="detail-value">{{ selectedOrder.product?.name || 'N/A' }}</div>
              <div class="detail-sublabel">Código: {{ selectedOrder.externalCode || 'N/A' }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="detail-box">
              <v-icon small class="detail-icon" color="green">mdi-map-marker</v-icon>
              <div class="detail-label">Cliente</div>
              <div class="detail-value">{{ selectedOrder.client?.contactName || 'N/A' }}</div>
              <div class="detail-sublabel">Código: {{ selectedOrder.client?.externalCode || 'N/A' }}</div>
            </div>
          </v-col>
        </v-row>

        <!-- Preset destacado -->
        <v-row v-if="!loadingDetails" class="mb-4">
          <v-col cols="12">
            <div class="preset-box">
              <v-icon class="preset-icon" color="orange">mdi-package-variant</v-icon>
              <span class="preset-label">Preset</span>
              <span class="preset-value">{{ (selectedOrder.preset || 0).toLocaleString() }} kg totales</span>
            </div>
          </v-col>
        </v-row>

        <!-- Métricas de Carga -->
        <div v-if="!loadingDetails" class="section-title mb-3">
          <v-icon small color="orange" class="mr-2">mdi-fire</v-icon>
          Métricas de Carga
        </div>
        <v-row v-if="!loadingDetails" class="mb-4">
          <v-col cols="12" md="4">
            <div class="metric-box">
              <v-icon class="metric-icon" color="orange">mdi-database</v-icon>
              <div class="metric-label">Masa Acumulada</div>
              <div class="metric-value">{{ (selectedOrder.accumulatedMass || 0).toLocaleString(undefined, {maximumFractionDigits:3}) }} kg cargados</div>
              <!-- <div class="metric-progress">{{ getProgress(selectedOrder).toFixed(1) }}%</div> -->
              <!-- <div v-if="getOvercharge(selectedOrder) > 0" class="metric-sublabel">Sobrecarga: +{{ getOvercharge(selectedOrder).toFixed(3) }} kg</div> -->
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="metric-box">
              <v-icon class="metric-icon" color="blue">mdi-water</v-icon>
              <div class="metric-label">Densidad</div>
              <div class="metric-value">{{ selectedOrder.density || 0 }}</div>
              <div class="metric-unit">kg/L</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="metric-box">
              <v-icon class="metric-icon" color="orange">mdi-thermometer</v-icon>
              <div class="metric-label">Temperatura</div>
              <div class="metric-value">{{ selectedOrder.temperature || 0 }}</div>
              <div class="metric-unit">°C</div>
            </div>
          </v-col>
        </v-row>

        <v-row v-if="!loadingDetails" class="mb-4">
          <v-col cols="12">
            <div class="metric-box-wide">
              <v-icon class="metric-icon" color="green">mdi-swap-vertical</v-icon>
              <div class="metric-label">Caudal</div>
              <div class="metric-value-large">{{ formatFlow(selectedOrder.caudal) }} kg/hora</div>
            </div>
          </v-col>
        </v-row>

        <!-- ETA y Tiempo Transcurrido -->

        <!-- Masa restante = 20,000 - 5,000 = 15,000 kg -->
        <!-- Caudal por minuto = 12,000 / 60 = 200 kg/min -->
        <!-- ETA = 15,000 / 200 = 75 minutos = 1h 15m -->

        <div v-if="!loadingDetails" class="section-title mb-3">
          <v-icon small color="blue" class="mr-2">mdi-clock-outline</v-icon>
          Tiempos de Carga
        </div>
        <v-row v-if="!loadingDetails" class="mb-4">
          <v-col cols="12" md="6">
            <div class="time-box">
              <v-icon class="time-icon" color="cyan">mdi-clock-fast</v-icon>
              <div class="time-label">ETA (Tiempo Estimado)</div>
              <div class="time-value">{{ formatETA(calculateETA(selectedOrder)) }}</div>
              <div class="time-sublabel">Basado en preset, masa acumulada y caudal actual</div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="time-box">
              <v-icon class="time-icon" color="purple">mdi-timer-outline</v-icon>
              <div class="time-label">Tiempo Transcurrido</div>
              <div class="time-value">{{ formatElapsedTime(calculateElapsedTime(selectedOrder)) }}</div>
              <div class="time-sublabel">Desde inicio hasta fin de carga</div>
            </div>
          </v-col>
        </v-row>

        <!-- Pesos -->
        <v-row v-if="!loadingDetails" class="mb-4">
          <v-col cols="12" md="4">
            <div class="weight-box">
              <v-icon small class="weight-icon" color="blue-grey">mdi-scale</v-icon>
              <div class="weight-label">Peso Inicial (Tara)</div>
              <div class="weight-value">{{ (selectedOrder.initialWeight || 0).toLocaleString() }} kg</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="weight-box">
              <v-icon small class="weight-icon" color="green">mdi-scale</v-icon>
              <div class="weight-label">Peso Final</div>
              <div class="weight-value">{{ (selectedOrder.finalWeight || 0).toLocaleString() }} kg</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="weight-box">
              <v-icon small class="weight-icon" color="orange">mdi-note</v-icon>
              <div class="weight-label">Peso Neto</div>
              <div class="weight-value">{{ ((selectedOrder.finalWeight || 0) - (selectedOrder.initialWeight || 0)).toLocaleString(undefined, {maximumFractionDigits:3}) }} kg</div>
            </div>
          </v-col>
        </v-row>

        <!-- Línea de Tiempo -->
        <div v-if="!loadingDetails" class="section-title mb-3">
          <v-icon small color="blue" class="mr-2">mdi-clock-outline</v-icon>
          Línea de Tiempo
        </div>
        <div v-if="!loadingDetails" class="timeline-box mb-4">
          <div class="timeline-item">
            <span class="timeline-label">Recepción:</span>
            <span class="timeline-value">{{ formatDateTime(selectedOrder.initialReception) }}</span>
          </div>
          <div class="timeline-item">
            <span class="timeline-label">Pesaje Inicial (Tara):</span>
            <span class="timeline-value">{{ formatDateTime(selectedOrder.initialWeighing) }}</span>
          </div>
          <div class="timeline-item">
            <span class="timeline-label">Inicio Carga:</span>
            <span class="timeline-value">{{ formatDateTime(selectedOrder.startLoading) }}</span>
          </div>
          <div class="timeline-item">
            <span class="timeline-label">Fin Carga:</span>
            <span class="timeline-value">{{ formatDateTime(selectedOrder.endLoading) }}</span>
          </div>
          <div v-if="selectedOrder.endWeighing" class="timeline-item">
            <span class="timeline-label">Pesaje Final:</span>
            <span class="timeline-value">{{ formatDateTime(selectedOrder.endWeighing) }}</span>
          </div>
          <div v-if="selectedOrder.closeOrder" class="timeline-item">
            <span class="timeline-label">Cierre de Orden:</span>
            <span class="timeline-value">{{ formatDateTime(selectedOrder.closeOrder) }}</span>
          </div>
        </div>

        <!-- Historial de Carga -->
        <div v-if="!loadingDetails" class="section-title mb-3">
          <v-icon small color="green" class="mr-2">mdi-chart-line</v-icon>
          Historial de Carga
        </div>
        
        <div v-if="loadingHistory" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="32"
          ></v-progress-circular>
          <p class="text-caption mt-2 text-grey">Cargando historial...</p>
        </div>
        
        <div v-else-if="orderDetails.length === 0" class="text-center py-8">
          <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
          <p class="text-caption text-grey mt-2">No hay registros de historial para esta orden</p>
        </div>
        
        <v-data-table
          v-else
          :headers="historyHeaders"
          :items="orderDetails"
          :items-per-page="5"
          density="compact"
          class="history-table mb-4"
        >
          <template v-slot:item.timestamp="{ item }">
            <span class="text-white text-body-2">{{ formatHistoryTimestamp(item.timestamp) }}</span>
          </template>
          
          <template v-slot:item.accumulatedMass="{ item }">
            <span class="text-white font-weight-medium">{{ formatNumber(item.accumulatedMass, 3) }}</span>
          </template>
          
          <template v-slot:item.density="{ item }">
            <span class="text-white">{{ formatNumber(item.density, 3) }}</span>
          </template>
          
          <template v-slot:item.temperature="{ item }">
            <span class="text-white">{{ formatNumber(item.temperature, 1) }}</span>
          </template>
          
          <template v-slot:item.caudal="{ item }">
            <span class="text-white">{{ formatNumber(item.caudal ? item.caudal * 60 : 0, 3) }}</span>
          </template>
        </v-data-table>

        <!-- Gráficos de Evolución (para órdenes en LOADING o estados superiores) -->
        <div v-if="selectedOrder && isLoadingOrBeyond(selectedOrder) && orderDetails.length > 0" class="mt-6">
          <div class="section-title mb-3">
            <v-icon small color="blue" class="mr-2">mdi-chart-line-variant</v-icon>
            Gráficos de Evolución
          </div>
          
          <LoadChartsDisplay :chart-data="processedChartData" />
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getOrderById, getOrderDetails } from '@/services/ordersService.js';
import { useLoadMonitoring } from '@/composables/useLoadMonitoring';
import LoadChartsDisplay from '@/components/LoadChartsDisplay.vue';

/**
 * Propiedades del componente
 * - orders: lista de órdenes a mostrar en la tabla.
 */
const props = defineProps({ orders: { type: Array, required: true } });

// Usar el composable de monitoreo de cargas
const { getOrderChartData, hasChartData } = useLoadMonitoring();

/**
 * Estado para el dialog de detalles
 */
const detailsDialog = ref(false);
const selectedOrder = ref(null);
const loadingDetails = ref(false);
const orderDetails = ref([]);
const loadingHistory = ref(false);

/**
 * Mapeo de estados a valores numéricos para comparaciones
 */
const stateValues = {
  'PENDING': 1,
  'TARA_REGISTERED': 2,
  'LOADING': 3,
  'FINALIZED': 4
}

/**
 * Verificar si la orden está en estado LOADING o superior (FINALIZED)
 */
function isLoadingOrBeyond(order) {
  if (!order) return false
  
  const state = order.state || order.status
  if (!state) return false
  
  const stateValue = stateValues[state] || 0
  return stateValue >= 3 // LOADING (3) o FINALIZED (4)
}

/**
 * Procesar datos del historial para los gráficos
 * Convierte orderDetails a formato de gráficos
 */
const processedChartData = computed(() => {
  if (!selectedOrder.value || orderDetails.value.length === 0) {
    return {
      timestamps: [],
      accumulatedMass: [],
      caudal: [],
      temperature: [],
      density: []
    }
  }

  // Primero intentar usar datos del composable si existen
  if (hasChartData(selectedOrder.value.id)) {
    return getOrderChartData(selectedOrder.value.id)
  }

  // Si no hay datos del WebSocket, usar el historial de la BD
  return {
    timestamps: orderDetails.value.map(detail => {
      const date = new Date(detail.timestamp)
      return date.toLocaleTimeString('es-AR')
    }),
    accumulatedMass: orderDetails.value.map(detail => Number(detail.accumulatedMass) || 0),
    caudal: orderDetails.value.map(detail => Number(detail.caudal) || 0),
    temperature: orderDetails.value.map(detail => Number(detail.temperature) || 0),
    density: orderDetails.value.map(detail => Number(detail.density) || 0)
  }
})

/**
 * Abre el dialog con los detalles de una orden
 * Carga los datos completos desde el backend
 */
async function openOrderDetails(event, { item }) {
  loadingDetails.value = true;
  detailsDialog.value = true;
  orderDetails.value = [];
  
  try {
    // Obtener datos completos de la orden desde el backend
    const fullOrder = await getOrderById(item.id);
    selectedOrder.value = fullOrder;
    
    // Cargar historial de detalles en paralelo
    loadOrderHistory(item.id);
  } catch (error) {
    selectedOrder.value = item; // Fallback a los datos básicos
  } finally {
    loadingDetails.value = false;
  }
}

/**
 * Carga el historial de detalles de la orden
 */
async function loadOrderHistory(orderId) {
  loadingHistory.value = true;
  try {
    const details = await getOrderDetails(orderId);
    orderDetails.value = details;
  } catch (error) {
    orderDetails.value = [];
  } finally {
    loadingHistory.value = false;
  }
}

/**
 * Definición de headers de la tabla en español
 */
const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Número', key: 'number', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Progreso', key: 'progress', sortable: false },
  { title: 'Camión', key: 'truck', sortable: true },
  { title: 'Preset (kg)', key: 'preset', sortable: true },
  { title: 'Acumulado (kg)', key: 'accumulated', sortable: true },
  { title: 'Temp. (°C)', key: 'lastTemp', sortable: true },
  { title: 'Densidad', key: 'density', sortable: true },
  { title: 'Caudal (kg/h)', key: 'flow', sortable: true }
];

/**
 * Headers para la tabla de historial de detalles
 */
const historyHeaders = [
  { title: 'Fecha y Hora', key: 'timestamp', sortable: true },
  { title: 'Masa Acumulada (kg cargados)', key: 'accumulatedMass', sortable: true },
  { title: 'Densidad (kg/L)', key: 'density', sortable: true },
  { title: 'Temperatura (°C)', key: 'temperature', sortable: true },
  { title: 'Caudal (kg/hora)', key: 'caudal', sortable: true }
];

/**
 * Calcula el porcentaje de progreso de una orden.
 * Se asegura de no superar el 100%.
 */
function progressPercent(o) {
  if (!o || !o.preset || !o.accumulated) return 0;
  return Math.min(100, (o.accumulated / o.preset) * 100);
}

/**
 * Devuelve un color según el estado de la orden.
 * Se usa en el chip de la columna "status".
 */
function statusColor(s) {
  if (!s) return 'grey';
  if (s === 'PENDING') return 'grey darken-1';
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
 * Formatea fecha y hora desde el backend
 */
function formatDateTime(dateTime) {
  if (!dateTime) return 'N/A';
  const date = new Date(dateTime);
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calcula el progreso de la orden
 */
function getProgress(order) {
  if (!order.preset || !order.accumulatedMass) return 0;
  return Math.min(100, (order.accumulatedMass / order.preset) * 100);
}

/**
 * Calcula la sobrecarga si existe
 */
function getOvercharge(order) {
  if (!order.preset || !order.accumulatedMass) return 0;
  const diff = order.accumulatedMass - order.preset;
  return diff > 0 ? diff : 0;
}

/**
 * Formatea números con punto como separador de miles y coma para decimales
 */
function formatNumber(value, decimals = 3) {
  if (!value && value !== 0) return '-';
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formatea timestamp para el historial (DD/MM/YYYY, HH:MM)
 */
function formatHistoryTimestamp(dateTime) {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calcula el ETA (tiempo estimado de llenado) en minutos
 * ETA = (Preset - Masa Acumulada) / (Caudal / 60)
 */
function calculateETA(order) {
  if (!order || !order.preset || !order.caudal || order.caudal <= 0) return null;
  
  const remaining = order.preset - (order.accumulatedMass || 0);
  if (remaining <= 0) return 0;
  
  // Caudal viene en kg/hora, lo convertimos a kg/min
  const caudalPerMinute = order.caudal / 60;
  const etaMinutes = remaining / caudalPerMinute;
  
  return Math.ceil(etaMinutes);
}

/**
 * Formatea el ETA en formato legible (Xh Ym)
 */
function formatETA(minutes) {
  if (!minutes && minutes !== 0) return 'N/A';
  if (minutes === 0) return 'Completado';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Calcula el tiempo transcurrido desde el inicio hasta el fin de la carga
 * Solo muestra el tiempo si ambas fechas existen
 */
function calculateElapsedTime(order) {
  if (!order || !order.startLoading || !order.endLoading) return null;
  
  const startTime = new Date(order.startLoading);
  const endTime = new Date(order.endLoading);
  
  const elapsedMs = endTime - startTime;
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  
  return elapsedMinutes;
}

/**
 * Formatea el tiempo transcurrido en formato legible (Xh Ym)
 */
function formatElapsedTime(minutes) {
  if (!minutes && minutes !== 0) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
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

/* Estilos para el dialog de detalles */
.order-details-card {
  background: linear-gradient(135deg, rgba(24,36,52,0.98) 0%, rgba(18,28,42,0.98) 100%);
  color: #fff;
}

.order-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
}

/* Cajas de detalles superiores */
.detail-box {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  height: 100%;
}

.detail-icon {
  margin-bottom: 8px;
}

.detail-label {
  color: rgba(255,255,255,0.6);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.detail-sublabel {
  color: rgba(255,255,255,0.4);
  font-size: 11px;
}

/* Preset destacado */
.preset-box {
  background: linear-gradient(90deg, rgba(255,152,0,0.1) 0%, rgba(255,152,0,0.05) 100%);
  border: 1px solid rgba(255,152,0,0.3);
  border-left: 4px solid #ff9800;
  border-radius: 8px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.preset-icon {
  font-size: 32px;
}

.preset-label {
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  font-weight: 500;
}

.preset-value {
  color: #ff9800;
  font-size: 24px;
  font-weight: 700;
  margin-left: auto;
}

/* Cajas de métricas */
.metric-box {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.metric-icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.metric-label {
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}

.metric-unit {
  color: rgba(255,255,255,0.5);
  font-size: 13px;
}

.metric-progress {
  color: #4caf50;
  font-size: 14px;
  font-weight: 600;
}

.metric-sublabel {
  color: #ff5252;
  font-size: 11px;
  margin-top: 4px;
}

.metric-box-wide {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-value-large {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  margin-left: auto;
}

/* Cajas de pesos */
.weight-box {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weight-icon {
  align-self: flex-start;
  margin-bottom: 4px;
}

.weight-label {
  color: rgba(255,255,255,0.6);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.weight-value {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}

/* Cajas de tiempo (ETA y Tiempo transcurrido) */
.time-box {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.time-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.time-label {
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.time-value {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.time-sublabel {
  color: rgba(255,255,255,0.4);
  font-size: 11px;
  text-align: center;
  line-height: 1.4;
}

/* Línea de tiempo */
.timeline-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-label {
  color: rgba(255,255,255,0.6);
  font-size: 12px;
}

.timeline-value {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

/* Tabla de historial */
.history-table {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  overflow: hidden;
}

/* Headers de la tabla de historial */
.history-table :deep(thead) {
  background: rgba(255,255,255,0.05);
}

.history-table :deep(thead th) {
  color: rgba(255,255,255,0.9) !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid rgba(255,255,255,0.1) !important;
}

/* Filas de la tabla de historial */
.history-table :deep(tbody tr) {
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.history-table :deep(tbody tr:hover) {
  background: rgba(255,255,255,0.05) !important;
}

.history-table :deep(tbody td) {
  color: #fff !important;
  font-size: 13px !important;
  padding: 10px 16px !important;
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
}

/* Footer de paginación */
.history-table :deep(.v-data-table-footer) {
  background: rgba(255,255,255,0.02);
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 8px 16px;
}

.history-table :deep(.v-data-table-footer .v-select) {
  color: #fff !important;
}

.history-table :deep(.v-data-table-footer .v-select__selection) {
  color: #fff !important;
}

.history-table :deep(.v-data-table-footer .v-pagination) {
  color: #fff !important;
}

.history-table :deep(.v-data-table-footer .v-pagination__item) {
  color: #fff !important;
  background: rgba(255,255,255,0.05) !important;
}

.history-table :deep(.v-data-table-footer .v-pagination__item--active) {
  background: rgba(255,255,255,0.15) !important;
}

.history-table :deep(.v-data-table-footer .v-pagination__navigation) {
  color: #fff !important;
  background: rgba(255,255,255,0.05) !important;
}

.history-table :deep(.v-data-table-footer .v-pagination__navigation .v-icon) {
  color: #fff !important;
}

.history-table :deep(.v-data-table-footer .v-data-table-footer__items-per-page) {
  color: #fff !important;
}

.history-table :deep(.v-data-table-footer .v-data-table-footer__info) {
  color: rgba(255,255,255,0.7) !important;
}

.history-header {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1.2fr 1.2fr;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.7);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.history-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1.2fr 1.2fr;
  gap: 12px;
  padding: 12px 16px;
  color: #fff;
  font-size: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.history-row:last-child {
  border-bottom: none;
}

.history-row:hover {
  background: rgba(255,255,255,0.04);
}

/* Nota de historial */
.history-note {
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  line-height: 1.5;
}

.orders-table :deep(tbody tr) {
  cursor: pointer;
}
</style>