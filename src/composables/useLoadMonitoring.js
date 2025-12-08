import { ref } from 'vue'

// Estado compartido que persiste entre navegaciones
const orderMetrics = ref({})
const orderChartData = ref({})

/**
 * Composable para gestionar el monitoreo de cargas en tiempo real
 * Mantiene el estado persistente entre navegaciones
 */
export function useLoadMonitoring() {
  
  /**
   * Inicializar métricas de una orden
   */
  function initializeOrderMetrics(orderId, initialData = {}) {
    if (!orderMetrics.value[orderId]) {
      orderMetrics.value[orderId] = {
        temperature: initialData.temperature || 0,
        caudal: initialData.caudal || 0,
        density: initialData.density || 0,
        accumulatedMass: initialData.accumulatedMass || 0,
        timestamp: initialData.timestamp || null
      }
    }
  }

  /**
   * Inicializar datos de gráficos de una orden
   */
  function initializeOrderChartData(orderId) {
    if (!orderChartData.value[orderId]) {
      orderChartData.value[orderId] = {
        timestamps: [],
        accumulatedMass: [],
        caudal: [],
        temperature: [],
        density: []
      }
    }
  }

  /**
   * Actualizar métricas de una orden
   */
  function updateOrderMetrics(orderId, newData) {
    if (!orderMetrics.value[orderId]) {
      initializeOrderMetrics(orderId)
    }
    
    orderMetrics.value[orderId] = {
      temperature: Number(newData.temperature) || 0,
      caudal: Number(newData.caudal) || 0,
      density: Number(newData.density) || 0,
      accumulatedMass: Number(newData.accumulatedMass) || 0,
      timestamp: newData.timestamp
    }
  }

  /**
   * Agregar punto de datos al historial de gráficos
   */
  function addChartDataPoint(orderId, orderDetail) {
    initializeOrderChartData(orderId)
    
    const currentData = orderChartData.value[orderId]
    const now = new Date(orderDetail.timestamp || Date.now())
    
    currentData.timestamps.push(now.toLocaleTimeString('es-AR'))
    currentData.accumulatedMass.push(Number(orderDetail.accumulatedMass) || 0)
    currentData.caudal.push(Number(orderDetail.caudal) || 0)
    currentData.temperature.push(Number(orderDetail.temperature) || 0)
    currentData.density.push(Number(orderDetail.density) || 0)
    
    // Mantener solo los últimos 100 puntos para mejor rendimiento
    if (currentData.timestamps.length > 100) {
      currentData.timestamps.shift()
      currentData.accumulatedMass.shift()
      currentData.caudal.shift()
      currentData.temperature.shift()
      currentData.density.shift()
    }
  }

  /**
   * Obtener métricas de una orden
   */
  function getOrderMetrics(orderId) {
    return orderMetrics.value[orderId] || {
      temperature: 0,
      caudal: 0,
      density: 0,
      accumulatedMass: 0
    }
  }

  /**
   * Obtener datos de gráficos de una orden
   */
  function getOrderChartData(orderId) {
    if (!orderChartData.value[orderId]) {
      initializeOrderChartData(orderId)
    }
    return orderChartData.value[orderId]
  }

  /**
   * Limpiar datos de órdenes que ya no están en estado TARA_REGISTERED
   */
  function cleanupInactiveOrders(activeOrderIds) {
    Object.keys(orderChartData.value).forEach(orderId => {
      if (!activeOrderIds.includes(Number(orderId))) {
        delete orderChartData.value[orderId]
        delete orderMetrics.value[orderId]
      }
    })
  }

  /**
   * Verificar si una orden tiene datos de gráficos
   */
  function hasChartData(orderId) {
    const data = orderChartData.value[orderId]
    return data && data.timestamps.length > 0
  }

  return {
    orderMetrics,
    orderChartData,
    initializeOrderMetrics,
    initializeOrderChartData,
    updateOrderMetrics,
    addChartDataPoint,
    getOrderMetrics,
    getOrderChartData,
    cleanupInactiveOrders,
    hasChartData
  }
}
