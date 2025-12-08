<template>
  <!-- Vista de Carga en Tiempo Real -->
  <cargo-layout>
    <v-row class="mb-6">
      <v-col cols="12">
        <!-- Tarjeta principal con lista de órdenes -->
        <v-card elevation="6" class="pa-4 monitoring-card">
          <!-- Encabezado -->
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <h4 class="mb-1">Carga en Tiempo Real</h4>
              <div class="caption">Monitoreo de operaciones de carga activas</div>
            </div>
            <v-chip color="success" variant="flat" size="small">
              <v-icon start size="small">mdi-circle-medium</v-icon>
              {{ availableOrders.length }} Órdenes Disponibles
            </v-chip>
          </div>

          <!-- Mensaje de error -->
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = null">
            {{ errorMessage }}
          </v-alert>

          <!-- Loading -->
          <div v-if="loadingOrders" class="text-center py-8">
            <v-progress-circular indeterminate color="orange" size="48"></v-progress-circular>
            <p class="muted mt-4">Cargando órdenes disponibles...</p>
          </div>

          <!-- Sin órdenes -->
          <div v-else-if="!loadingOrders && availableOrders.length === 0" class="text-center py-12">
            <v-icon size="80" class="muted mb-4">mdi-truck-cargo-container</v-icon>
            <h4 class="muted">No hay órdenes con tara registrada</h4>
            <p class="caption mt-2">Las órdenes aparecerán aquí cuando estén listas para cargar</p>
          </div>

          <!-- Lista de órdenes expandibles -->
          <div v-else>
            <v-expansion-panels variant="accordion" class="orders-expansion">
              <v-expansion-panel
                v-for="order in availableOrders"
                :key="order.id"
                class="order-panel"
              >
                <!-- Header del panel (siempre visible) -->
                <v-expansion-panel-title class="order-header">
                  <div class="d-flex align-items-center w-100">
                    <v-icon color="orange" size="large" class="me-4">mdi-truck-cargo-container</v-icon>
                    
                    <span class="order-number">{{ order.number }}</span>
                  </div>
                </v-expansion-panel-title>

                <!-- Contenido expandible (detalles y métricas) -->
                <v-expansion-panel-text>
                  <v-divider class="mb-4"></v-divider>
                  
                  <!-- Métricas en tiempo real -->
                  <v-row class="mb-4">
                    <v-col cols="12" md="6" lg="3">
                      <div class="metric-box">
                        <div class="d-flex align-items-center justify-space-between">
                          <div>
                            <div class="metric-label">Temperatura</div>
                            <div class="metric-value-small">{{ formatNumber(getMetrics(order.id).temperature, 1) }}</div>
                            <div class="metric-unit">°C</div>
                          </div>
                          <v-icon size="40" color="orange-lighten-1">mdi-thermometer</v-icon>
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" md="6" lg="3">
                      <div class="metric-box">
                        <div class="d-flex align-items-center justify-space-between">
                          <div>
                            <div class="metric-label">Caudal</div>
                            <div class="metric-value-small">{{ formatNumber(getMetrics(order.id).caudal, 2) }}</div>
                            <div class="metric-unit">kg/hora</div>
                          </div>
                          <v-icon size="40" color="blue-lighten-1">mdi-waves</v-icon>
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" md="6" lg="3">
                      <div class="metric-box">
                        <div class="d-flex align-items-center justify-space-between">
                          <div>
                            <div class="metric-label">Densidad</div>
                            <div class="metric-value-small">{{ formatNumber(getMetrics(order.id).density, 3) }}</div>
                            <div class="metric-unit">kg/L</div>
                          </div>
                          <v-icon size="40" color="purple-lighten-1">mdi-weight</v-icon>
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" md="6" lg="3">
                      <div class="metric-box">
                        <div class="d-flex align-items-center justify-space-between">
                          <div>
                            <div class="metric-label">Masa Acumulada</div>
                            <div class="metric-value-small">{{ formatNumber(getMetrics(order.id).accumulatedMass, 0) }}</div>
                            <div class="metric-unit">kg cargados</div>
                          </div>
                          <v-icon size="40" color="green-lighten-1">mdi-scale-balance</v-icon>
                        </div>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Progress bar -->
                  <div class="progress-section mb-4">
                    <div class="d-flex align-items-center justify-space-between mb-2">
                      <span class="progress-label">Progreso de Carga</span>
                      <span class="accent progress-percentage">{{ getProgress(order) }}%</span>
                    </div>
                    <v-progress-linear
                      :model-value="getProgress(order)"
                      height="24"
                      color="success"
                      rounded
                      striped
                    >
                      <template v-slot:default>
                        <strong style="color: white; font-size: 0.75rem;">
                          {{ formatNumber(getMetrics(order.id).accumulatedMass, 0) }} / {{ formatNumber(order.preset, 0) }} kg
                        </strong>
                      </template>
                    </v-progress-linear>
                  </div>

                  <!-- Tiempos -->
                  <v-row class="mb-4">
                    <v-col cols="12" md="6">
                      <div class="time-box">
                        <div class="d-flex align-items-center justify-space-between">
                          <div>
                            <div class="metric-label">Tiempo Estimado (ETA)</div>
                            <div class="time-value accent">{{ getETA(order) }}</div>
                          </div>
                          <v-icon size="40" color="teal">mdi-clock-end</v-icon>
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" md="6">
                      <div class="time-box">
                        <div class="d-flex align-items-center justify-space-between">
                          <div>
                            <div class="metric-label">Estado de Conexión</div>
                            <div class="d-flex align-items-center gap-2 mt-2">
                              <v-icon :color="wsConnected ? 'success' : 'grey'" size="small">mdi-circle</v-icon>
                              <span class="connection-status">{{ wsConnected ? 'Conectado' : 'Desconectado' }}</span>
                            </div>
                          </div>
                          <v-icon size="40" color="blue-grey">mdi-lan-connect</v-icon>
                        </div>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Botón de acción -->
                  <div class="text-center">
                    <v-btn
                      color="orange"
                      variant="flat"
                      prepend-icon="mdi-chart-line"
                      @click="openDetailedView(order)"
                    >
                      Ver Gráficos en Tiempo Real
                    </v-btn>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Card de Gráficos en Tiempo Real (Modal) -->
    <v-dialog v-model="showChartsDialog" max-width="1400" persistent>
      <v-card v-if="selectedOrderForCharts" class="charts-modal-card">
        <!-- Header de la card -->
        <v-card-title class="d-flex align-items-center justify-space-between pa-4">
          <div>
            <h4>Gráficos en Tiempo Real - Orden {{ selectedOrderForCharts.number }}</h4>
            <div class="caption mt-1">
              <v-icon size="small" class="me-1">mdi-tanker-truck</v-icon>
              {{ selectedOrderForCharts.truck?.license }} | 
              <v-icon size="small" class="me-1">mdi-account</v-icon>
              {{ selectedOrderForCharts.driver?.name }}
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeDetailedView"
          ></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Contenido de gráficos -->
        <v-card-text class="pa-6">
          <v-row>
            <!-- Métricas actuales -->
            <v-col cols="12">
              <v-row class="mb-4">
                <v-col cols="12" sm="6" md="3">
                  <div class="metric-box">
                    <div class="d-flex align-items-center justify-space-between">
                      <div>
                        <div class="metric-label">Temperatura</div>
                        <div class="metric-value">{{ formatNumber(getMetrics(selectedOrderForCharts.id).temperature, 1) }}</div>
                        <div class="metric-unit">°C</div>
                      </div>
                      <v-icon size="48" color="orange-lighten-1">mdi-thermometer</v-icon>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <div class="metric-box">
                    <div class="d-flex align-items-center justify-space-between">
                      <div>
                        <div class="metric-label">Caudal</div>
                        <div class="metric-value">{{ formatNumber(getMetrics(selectedOrderForCharts.id).caudal, 2) }}</div>
                        <div class="metric-unit">kg/hora</div>
                      </div>
                      <v-icon size="48" color="blue-lighten-1">mdi-waves</v-icon>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <div class="metric-box">
                    <div class="d-flex align-items-center justify-space-between">
                      <div>
                        <div class="metric-label">Densidad</div>
                        <div class="metric-value">{{ formatNumber(getMetrics(selectedOrderForCharts.id).density, 3) }}</div>
                        <div class="metric-unit">kg/L</div>
                      </div>
                      <v-icon size="48" color="purple-lighten-1">mdi-weight</v-icon>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <div class="metric-box">
                    <div class="d-flex align-items-center justify-space-between">
                      <div>
                        <div class="metric-label">Masa Acumulada</div>
                        <div class="metric-value">{{ formatNumber(getMetrics(selectedOrderForCharts.id).accumulatedMass, 0) }}</div>
                        <div class="metric-unit">kg cargados</div>
                      </div>
                      <v-icon size="48" color="green-lighten-1">mdi-scale-balance</v-icon>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-col>

            <!-- Gráficos en tiempo real (Placeholders temporales) -->
            <v-col cols="12" class="mb-4">
              <h5 class="mb-3">Medidores en Tiempo Real</h5>
            </v-col>

            <!-- Placeholder Temperatura -->
            <v-col cols="12" md="4">
              <div class="chart-placeholder">
                <v-icon size="64" color="orange" class="mb-4">mdi-thermometer</v-icon>
                <h6 class="mb-2">Temperatura</h6>
                <div class="metric-value">{{ formatNumber(getMetrics(selectedOrderForCharts.id).temperature, 1) }} °C</div>
                <p class="caption mt-2">Manómetro en desarrollo</p>
              </div>
            </v-col>

            <!-- Placeholder Caudal -->
            <v-col cols="12" md="4">
              <div class="chart-placeholder">
                <v-icon size="64" color="blue" class="mb-4">mdi-waves</v-icon>
                <h6 class="mb-2">Caudal</h6>
                <div class="metric-value">{{ formatNumber(getMetrics(selectedOrderForCharts.id).caudal, 2) }} kg/h</div>
                <p class="caption mt-2">Manómetro en desarrollo</p>
              </div>
            </v-col>

            <!-- Placeholder Densidad -->
            <v-col cols="12" md="4">
              <div class="chart-placeholder">
                <v-icon size="64" color="purple" class="mb-4">mdi-weight</v-icon>
                <h6 class="mb-2">Densidad</h6>
                <div class="metric-value">{{ formatNumber(getMetrics(selectedOrderForCharts.id).density, 3) }} kg/L</div>
                <p class="caption mt-2">Manómetro en desarrollo</p>
              </div>
            </v-col>

            <!-- Barra de progreso de Masa Acumulada -->
            <v-col cols="12">
              <div class="chart-container">
                <h6 class="chart-title mb-3">Progreso de Carga</h6>
                <div class="progress-detail">
                  <div class="d-flex align-items-center justify-space-between mb-2">
                    <span class="progress-text">
                      {{ formatNumber(getMetrics(selectedOrderForCharts.id).accumulatedMass, 0) }} / 
                      {{ formatNumber(selectedOrderForCharts.preset, 0) }} kg
                    </span>
                    <span class="accent progress-percentage">{{ getProgress(selectedOrderForCharts) }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="getProgress(selectedOrderForCharts)"
                    height="32"
                    color="success"
                    rounded
                    striped
                  >
                    <template v-slot:default>
                      <strong style="color: white; font-size: 0.9rem;">
                        {{ getETA(selectedOrderForCharts) }}
                      </strong>
                    </template>
                  </v-progress-linear>
                </div>
              </div>
            </v-col>

            <!-- Componente reutilizable de gráficos -->
            <LoadChartsDisplay :chart-data="chartData" />
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <!-- Footer con acciones -->
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="orange"
            variant="flat"
            @click="closeDetailedView"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </cargo-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import CargoLayout from '@/layouts/CargoLayout.vue'
import { getOrders } from '@/services/ordersService.js'
import { useLoadMonitoring } from '@/composables/useLoadMonitoring'
import LoadChartsDisplay from '@/components/LoadChartsDisplay.vue'

// Usar el composable de monitoreo de cargas (estado compartido)
const {
  initializeOrderMetrics,
  initializeOrderChartData,
  updateOrderMetrics,
  addChartDataPoint,
  getOrderMetrics,
  getOrderChartData,
  cleanupInactiveOrders,
  hasChartData
} = useLoadMonitoring()

// Lista de órdenes disponibles (estado TARA_REGISTERED)
const availableOrders = ref([])
const loadingOrders = ref(false)
const errorMessage = ref(null)

// Estado de conexión WebSocket
const wsConnected = ref(false)

// Orden seleccionada para mostrar gráficos en tiempo real
const selectedOrderForCharts = ref(null)
const showChartsDialog = ref(false)

// Obtener datos del gráfico de la orden seleccionada
const chartData = computed(() => {
  if (!selectedOrderForCharts.value) {
    return {
      timestamps: [],
      accumulatedMass: [],
      caudal: [],
      temperature: [],
      density: []
    }
  }
  
  return getOrderChartData(selectedOrderForCharts.value.id)
})

// Cargar órdenes en estado TARA_REGISTERED al montar el componente
onMounted(async () => {
  await loadAvailableOrders()
})

// Cargar órdenes con estado TARA_REGISTERED
async function loadAvailableOrders() {
  loadingOrders.value = true
  errorMessage.value = null
  
  try {
    const allOrders = await getOrders()
    
    // Filtrar solo las órdenes en estado TARA_REGISTERED (estado 2)
    const taraRegisteredOrders = allOrders.filter(order => 
      order.status === 'TARA_REGISTERED' || order.state === 'TARA_REGISTERED'
    )
    
    // Limpiar datos de órdenes que cambiaron de estado
    const currentOrderIds = taraRegisteredOrders.map(o => o.id)
    cleanupInactiveOrders(currentOrderIds)
    
    availableOrders.value = taraRegisteredOrders
    
    // Inicializar métricas con datos reales de la orden (solo si no existen)
    availableOrders.value.forEach(order => {
      initializeOrderMetrics(order.id, {
        temperature: order.temperature,
        caudal: order.caudal,
        density: order.density,
        accumulatedMass: order.accumulatedMass
      })
    })
  } catch (error) {
    console.error('Error al cargar órdenes:', error)
    errorMessage.value = error.message || 'Error al cargar las órdenes disponibles'
  } finally {
    loadingOrders.value = false
  }
}

// Obtener métricas de una orden específica
function getMetrics(orderId) {
  return getOrderMetrics(orderId)
}

// Calcular porcentaje de progreso
function getProgress(order) {
  if (!order.preset) return 0
  const metrics = getMetrics(order.id)
  const percentage = (metrics.accumulatedMass / order.preset) * 100
  return Math.min(Math.round(percentage * 100) / 100, 100)
}

// Calcular ETA
function getETA(order) {
  const metrics = getMetrics(order.id)
  const remaining = order.preset - metrics.accumulatedMass
  
  if (remaining <= 0) return 'Completado'
  if (metrics.caudal <= 0) return '--'
  
  const minutes = remaining / (metrics.caudal / 60)
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

// Formatear números con locale español
const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === '') return '--'
  return Number(value).toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// Abrir vista detallada con gráficos
async function openDetailedView(order) {
  selectedOrderForCharts.value = order
  showChartsDialog.value = true
  
  // Inicializar datos del gráfico si no existen para esta orden
  initializeOrderChartData(order.id)
  
  // Importar dinámicamente el WebSocket SOLO cuando se necesita
  try {
    const { default: websocketService } = await import('@/services/websocketService')
    
    const connected = await websocketService.connect()
    wsConnected.value = connected
    
    if (connected) {
      // Suscribirse a esta orden específica
      await websocketService.subscribeToOrderDetails(order.number, (orderDetail) => {
        // Actualizar métricas usando el composable
        updateOrderMetrics(order.id, orderDetail)
        
        // Agregar datos al historial de gráficos
        addChartDataPoint(order.id, orderDetail)
      })
    }
  } catch (error) {
    wsConnected.value = false
  }
}

// Cerrar vista detallada con gráficos
async function closeDetailedView() {
  showChartsDialog.value = false
  selectedOrderForCharts.value = null
  wsConnected.value = false
  
  // Desconectar WebSocket
  try {
    const { default: websocketService } = await import('@/services/websocketService')
    websocketService.disconnect()
  } catch (error) {
    // Ignorar errores al desconectar
  }
}
</script>

<style scoped>
h2, h4 {
  color: #fff;
  margin: 0;
}

/* Tarjeta principal */
.monitoring-card {
  background: rgba(8, 16, 26, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: #fff;
}

.caption {
  color: rgba(255, 255, 255, 0.65);
}

.muted {
  color: rgba(255, 255, 255, 0.45);
}

.accent {
  color: #ffb94d;
  font-weight: 700;
}

/* Card de modal de gráficos (no transparente) */
.charts-modal-card {
  background: #0a121e !important;
  color: #fff;
}

/* Expansion panels */
.orders-expansion {
  background: transparent;
}

.order-panel {
  background: rgba(10, 18, 30, 0.4);
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.order-panel:hover {
  border-color: rgba(255, 180, 77, 0.3);
}

.order-header {
  background: rgba(10, 18, 30, 0.3);
  color: #fff;
  padding: 16px 20px;
}

.order-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffb94d;
  line-height: 1;
}

.order-status {
  font-size: 1rem;
  font-weight: 600;
  color: #64b5f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
  margin-left: 24px;
}

/* Cajas de métricas */
.metric-box {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s;
}

.metric-box:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.metric-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.metric-value-small {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.metric-unit {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

/* Progress section */
.progress-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.progress-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.progress-percentage {
  font-size: 1.25rem;
}

/* Time box */
.time-box {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.time-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  margin-top: 4px;
}

.connection-status {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

/* Estilos para expansion panel */
:deep(.v-expansion-panel-title) {
  color: #fff;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 20px;
  background: rgba(8, 16, 26, 0.3);
}

:deep(.v-divider) {
  border-color: rgba(255, 255, 255, 0.1);
}

/* Chart placeholders */
.chart-placeholder {
  background: rgba(10, 18, 30, 0.5);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  padding: 48px 24px;
  text-align: center;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Chart containers */
.chart-container {
  background: rgba(10, 18, 30, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px;
}

.chart-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}

.progress-detail {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.progress-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  font-weight: 500;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffb94d;
  line-height: 1;
  margin: 8px 0 4px;
}

/* Responsive */
@media (max-width: 960px) {
  .order-subtitle {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .metric-value-small {
    font-size: 1.25rem;
  }
  
  .time-value {
    font-size: 1.5rem;
  }
}
</style>
