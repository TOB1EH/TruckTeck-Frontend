<template>
  <v-row v-if="hasData">
    <!-- Gráfico de Masa Acumulada -->
    <v-col cols="12" md="6">
      <div class="chart-container">
        <v-chart 
          :option="massChartOption" 
          style="height: 300px; width: 100%;"
          autoresize
        />
      </div>
    </v-col>

    <!-- Gráfico de Caudal -->
    <v-col cols="12" md="6">
      <div class="chart-container">
        <v-chart 
          :option="caudalChartOption" 
          style="height: 300px; width: 100%;"
          autoresize
        />
      </div>
    </v-col>

    <!-- Gráfico de Temperatura -->
    <v-col cols="12">
      <div class="chart-container">
        <v-chart 
          :option="temperatureChartOption" 
          style="height: 250px; width: 100%;"
          autoresize
        />
      </div>
    </v-col>
  </v-row>
  
  <div v-else class="text-center py-8">
    <v-icon size="48" color="grey-lighten-1">mdi-chart-line-variant</v-icon>
    <p class="text-caption text-grey mt-2">No hay datos de gráficos disponibles</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

// Registrar componentes de ECharts
use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer])

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    default: () => ({
      timestamps: [],
      accumulatedMass: [],
      caudal: [],
      temperature: [],
      density: []
    })
  }
})

// Verificar si hay datos
const hasData = computed(() => {
  return props.chartData.timestamps && props.chartData.timestamps.length > 0
})

// Configuración del gráfico de Masa Acumulada
const massChartOption = computed(() => ({
  title: {
    text: 'Evolución de Masa Acumulada',
    left: 'center',
    textStyle: { color: '#fff', fontSize: 16 }
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: '#333',
    textStyle: { color: '#fff' }
  },
  grid: {
    left: '50',
    right: '30',
    bottom: '40',
    top: '50'
  },
  xAxis: {
    type: 'category',
    data: props.chartData.timestamps,
    axisLabel: { color: '#aaa', rotate: 45 },
    axisLine: { lineStyle: { color: '#444' } }
  },
  yAxis: {
    type: 'value',
    name: 'kg',
    nameTextStyle: { color: '#aaa' },
    axisLabel: { color: '#aaa' },
    axisLine: { lineStyle: { color: '#444' } },
    splitLine: { lineStyle: { color: '#333' } }
  },
  series: [{
    name: 'Masa Acumulada',
    type: 'line',
    data: props.chartData.accumulatedMass,
    smooth: true,
    lineStyle: { color: '#4caf50', width: 3 },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(76, 175, 80, 0.5)' },
          { offset: 1, color: 'rgba(76, 175, 80, 0.1)' }
        ]
      }
    },
    symbol: 'circle',
    symbolSize: 6
  }]
}))

// Configuración del gráfico de Caudal
const caudalChartOption = computed(() => ({
  title: {
    text: 'Caudal de Carga',
    left: 'center',
    textStyle: { color: '#fff', fontSize: 16 }
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: '#333',
    textStyle: { color: '#fff' }
  },
  grid: {
    left: '50',
    right: '30',
    bottom: '40',
    top: '50'
  },
  xAxis: {
    type: 'category',
    data: props.chartData.timestamps,
    axisLabel: { color: '#aaa', rotate: 45 },
    axisLine: { lineStyle: { color: '#444' } }
  },
  yAxis: {
    type: 'value',
    name: 'kg/h',
    nameTextStyle: { color: '#aaa' },
    axisLabel: { color: '#aaa' },
    axisLine: { lineStyle: { color: '#444' } },
    splitLine: { lineStyle: { color: '#333' } }
  },
  series: [{
    name: 'Caudal',
    type: 'line',
    data: props.chartData.caudal,
    smooth: true,
    lineStyle: { color: '#2196f3', width: 2 },
    symbol: 'circle',
    symbolSize: 4
  }]
}))

// Configuración del gráfico de Temperatura
const temperatureChartOption = computed(() => ({
  title: {
    text: 'Temperatura del Producto',
    left: 'center',
    textStyle: { color: '#fff', fontSize: 16 }
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: '#333',
    textStyle: { color: '#fff' }
  },
  grid: {
    left: '50',
    right: '30',
    bottom: '40',
    top: '50'
  },
  xAxis: {
    type: 'category',
    data: props.chartData.timestamps,
    axisLabel: { color: '#aaa', rotate: 45 },
    axisLine: { lineStyle: { color: '#444' } }
  },
  yAxis: {
    type: 'value',
    name: '°C',
    nameTextStyle: { color: '#aaa' },
    axisLabel: { color: '#aaa' },
    axisLine: { lineStyle: { color: '#444' } },
    splitLine: { lineStyle: { color: '#333' } }
  },
  series: [{
    name: 'Temperatura',
    type: 'line',
    data: props.chartData.temperature,
    smooth: true,
    lineStyle: { color: '#ff9800', width: 2 },
    symbol: 'circle',
    symbolSize: 4
  }]
}))
</script>

<style scoped>
.chart-container {
  background: rgba(8, 16, 26, 0.4);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}
</style>
