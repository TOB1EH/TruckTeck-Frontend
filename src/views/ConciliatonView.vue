<template>
  <!--
    Vista principal de Conciliación.
    Se encapsula dentro del layout general <cargo-layout>, lo que garantiza
    que la navegación, app-bar y estilos globales se apliquen sin necesidad
    de repetir estructura.
  -->
  <cargo-layout>
    <v-container>

      <!-- Título principal de la sección -->
      <h2 class="mb-4">Conciliación</h2>

      <!--
        Tarjeta de consulta inicial.
        Permite seleccionar una orden finalizada y ejecutar la búsqueda
        de los datos de conciliación correspondientes.
      -->
      <v-card class="pa-4 mb-6 monitoring-card" elevation="6">

        <!-- Encabezado de la tarjeta -->
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h4 class="mb-1">Consultar Conciliación</h4>
            <div class="caption">Selecciona una orden finalizada para consultar los resultados de conciliación.</div>
          </div>
        </div>

        <!-- Mensaje de error general -->
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = null">
          {{ errorMessage }}
        </v-alert>

        <!-- Fila que contiene el selector de orden y el botón de consulta -->
        <v-row>
          <v-col cols="12" md="9">
            <!--
              Selector de órdenes finalizadas.
              Se cargan desde el servicio getFinalizedOrders() en el montaje del componente.
              El usuario elige un número de orden, el cual se guarda en `selected`.
            -->
            <v-select
              v-model="selected"
              :items="orderOptions"
              item-title="label"
              item-value="number"
              label="Selecciona una orden finalizada"
              density="compact"
              hide-details
              clearable
              :loading="loadingOrders"
              :disabled="loadingOrders"
              class="dark-select"
            />
          </v-col>

          <!--
              Botón para consultar los datos de conciliación.
              Se desactiva automáticamente si no hay una orden seleccionada.
            -->
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-btn 
              color="orange" 
              :disabled="!selected || loading" 
              :loading="loading"
              @click="onConsult"
            >
              Consultar
            </v-btn>
          </v-col>
        </v-row>

      </v-card>

       <!--
        Tarjeta donde se muestran los resultados de conciliación.
        Solo aparece cuando la variable reactiva `conciliation` contiene datos válidos.
      -->
      <v-card v-if="conciliation" class="pa-6 monitoring-card" elevation="6">

        <!-- Encabezado con número de orden y estado -->
        <div class="d-flex align-center justify-space-between mb-4">

          <div>
            <h4 class="mb-1">Conciliación: {{ conciliation.number }} <small class="muted">- {{ conciliation.truck }}</small></h4>
            <div class="caption">Resultado de conciliación</div>
          </div>

          <div class="d-flex align-center gap-2">
            <!-- Botón para descargar PDF -->
            <v-btn
              color="blue"
              size="small"
              :loading="downloadingPdf"
              :disabled="downloadingPdf"
              @click="onDownloadPdf"
              prepend-icon="mdi-file-pdf-box"
            >
              Descargar PDF
            </v-btn>
            
            <!-- Chip indicando que la orden está finalizada -->
            <v-chip color="green" size="small" text-color="white">FINALIZADA</v-chip>
          </div>
        </div>

        <!--
          Sección de métricas principales.
          Cada columna representa un indicador resultante del proceso de conciliación:
          - Peso inicial (tara)
          - Peso final
          - Peso neto (destacado)
          - Diferencia entre instrumentos
          - Temperatura promedio
          - Densidad
          - Caudal promedio
        -->
        <v-row class="g-4">

          <!-- Peso inicial -->
          <v-col cols="12" md="3">
            <v-card class="metric-card pa-4" elevation="0">
              <div class="metric-title"><v-icon class="me-2" color="blue darken-2">mdi-scale-bathroom</v-icon> Peso Inicial (Tara)</div>
              <div class="metric-value">{{ conciliation.presetKg?.toLocaleString() }} kg</div>
            </v-card>
          </v-col>

          <!-- Peso final -->
          <v-col cols="12" md="3">
            <v-card class="metric-card pa-4" elevation="0">
              <div class="metric-title"><v-icon class="me-2" color="green darken-2">mdi-scale-bathroom</v-icon> Peso Final</div>
              <div class="metric-value">{{ conciliation.finalKg?.toLocaleString() }} kg</div>
            </v-card>
          </v-col>

          <!-- Masa Acumulada -->
          <v-col cols="12" md="3">
            <v-card class="metric-card pa-4" elevation="0">
              <div class="metric-title"><v-icon class="me-2" color="cyan darken-2">mdi-sigma</v-icon> Masa Acumulada</div>
              <div class="metric-value">{{ conciliation.accumulatedMassKg?.toLocaleString() }} kg</div>
            </v-card>
          </v-col>

          <!-- Peso Neto (destacado) -->
          <v-col cols="12" md="3">
            <v-card class="metric-card metric-highlight pa-4" elevation="0">
              <div class="metric-title"><v-icon class="me-2" color="amber darken-2">mdi-weight-kilogram</v-icon> Peso Neto</div>
              <div class="metric-value highlight">{{ conciliation.netKg?.toLocaleString() }} kg</div>
            </v-card>
          </v-col>

          <!-- Diferencia entre instrumentos -->
          <v-col cols="12" md="3">
            <v-card class="metric-card pa-4" elevation="0">
              <div class="metric-title"><v-icon class="me-2" color="purple">mdi-chart-line-variant</v-icon> Diferencia (Balanza vs Caudalímetro)</div>
              <div class="metric-value">{{ conciliation.differenceKg }} kg</div>
            </v-card>
          </v-col>

          <!-- Temperatura promedio -->
          <v-col cols="12" md="4">
            <v-card class="metric-card pa-4" elevation="0">
              <div class="metric-title"><v-icon class="me-2" color="orange">mdi-thermometer</v-icon> Temperatura Promedio</div>
              <div class="metric-value">{{ conciliation.temperatureC }} °C</div>
            </v-card>
          </v-col>

          <!-- Densidad promedio -->
          <v-col cols="12" md="4">
            <v-card class="metric-card pa-4" elevation="0">
              <div class="metric-title"><v-icon class="me-2" color="blue">mdi-water</v-icon> Densidad Promedio</div>
              <div class="metric-value">{{ conciliation.density }}</div>
            </v-card>
          </v-col>

          <!-- Caudal promedio -->
          <v-col cols="12" md="4">
            <v-card class="metric-card pa-4" elevation="0">
              <div class="metric-title"><v-icon class="me-2" color="green">mdi-swap-vertical</v-icon> Caudal Promedio</div>
              <div class="metric-value">{{ conciliation.avgFlowKgPerHour.toLocaleString() }} kg/h</div>
            </v-card>
          </v-col>
          
        </v-row>
      </v-card>
    </v-container>
  </cargo-layout>
</template>

<script setup>
  /*
  Lógica del componente:
  - Carga inicial de órdenes finalizadas.
  - Manejo del estado seleccionado.
  - Consulta de conciliación según la orden elegida.
  */
  import { ref, onMounted } from 'vue';
  import { getFinalizedOrders, getConciliation, downloadConciliationPdf } from '@/services/conciliationService.js';
  import CargoLayout from '@/layouts/CargoLayout.vue';


  /* Lista de órdenes finalizadas disponibles para seleccionar */
  const orderOptions = ref([]);

  /* Orden seleccionada por el usuario */
  const selected = ref(null);

  /* Resultado de conciliación para la orden consultada */
  const conciliation = ref(null);

  /* Estado de carga */
  const loading = ref(false);
  const loadingOrders = ref(false);
  const downloadingPdf = ref(false);

  /* Mensajes de error */
  const errorMessage = ref(null);

  /*
  Al montar el componente:
  - Se consultan las órdenes finalizadas.
  - Se transforman en objetos { number, label } aptos para usar en v-select.
  */
  onMounted(async () => {
    loadingOrders.value = true;
    errorMessage.value = null;
    
    try {
      const list = await getFinalizedOrders();
      orderOptions.value = list;
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      errorMessage.value = error.message || 'Error al cargar las órdenes finalizadas';
    } finally {
      loadingOrders.value = false;
    }
  });

  /*
  Ejecuta la consulta de conciliación cuando el usuario hace clic en "Consultar".
  El flujo es:
  1. Validar si hay orden seleccionada.
  2. Vaciar resultados previos.
  3. Llamar al servicio getConciliation() y almacenar la respuesta.
  */
  async function onConsult() {
    if (!selected.value) return;
    
    loading.value = true;
    errorMessage.value = null;
    conciliation.value = null;
    
    try {
      conciliation.value = await getConciliation(selected.value);
    } catch (error) {
      console.error('Error al consultar conciliación:', error);
      errorMessage.value = error.message || 'Error al obtener la conciliación';
    } finally {
      loading.value = false;
    }
  }

  /*
  Descarga el PDF de conciliación de la orden actual.
  */
  async function onDownloadPdf() {
    // Usar el número de la conciliación o el seleccionado como fallback
    const orderNumber = conciliation.value?.number || selected.value;
    
    if (!orderNumber) {
      errorMessage.value = 'No se puede descargar el PDF: orden no identificada';
      return;
    }
    
    downloadingPdf.value = true;
    errorMessage.value = null;
    
    try {
      await downloadConciliationPdf(orderNumber);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      errorMessage.value = error.message || 'Error al descargar el PDF';
    } finally {
      downloadingPdf.value = false;
    }
  }
</script>

<style scoped>
  /* Estilos visuales ajustados al modo oscuro general de la aplicación */
  
  h2 { color: #fff; }
  
  .monitoring-card { 
    background: rgba(8,16,26,0.6); 
    color: #fff; 
    border-radius: 12px; 
    border: 1px solid rgba(255,255,255,0.04); 
  }
  
  .caption { color: rgba(255,255,255,0.65); }
  .muted { color: rgba(255,255,255,0.45); }
  
  .metric-card { 
    background: rgba(10,18,30,0.45); 
    border-radius: 10px; 
    border: 1px solid rgba(255,255,255,0.04); 
    color: #fff; 
    min-height: 88px; 
  }
  
  .metric-title { 
    color: rgba(255,255,255,0.75); 
    font-size: 0.9rem; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
  }
  
  .metric-value { 
    font-size: 1.6rem; 
    font-weight: 700; 
    margin-top: 6px; 
    color: #e6eef6; 
  }
  
  .metric-highlight { 
    border: 1px solid rgba(255, 180, 60, 0.16); 
  }
  
  .metric-value.highlight { 
    color: #ffb94d; 
  }
  
  /* Estilos para el v-select oscuro */
  .dark-select :deep(.v-field) {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
  
  .dark-select :deep(.v-field__input) {
    color: #fff;
  }
  
  .dark-select :deep(.v-field__outline) {
    color: rgba(255, 255, 255, 0.2);
  }
  
  .dark-select :deep(.v-label) {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .dark-select :deep(.v-icon) {
    color: rgba(255, 255, 255, 0.7);
  }
</style>

<!-- Estilos globales SIN scoped para el menú desplegable -->
<style>
.v-overlay__content .v-list {
  background: rgba(6, 12, 20, 0.95) !important;
  color: #fff !important;
}

.v-overlay__content .v-list-item {
  color: #fff !important;
}

.v-overlay__content .v-list-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.v-overlay__content .v-list-item--active {
  background: rgba(255, 180, 77, 0.2) !important;
  color: #ffb94d !important;
}

.v-overlay__content .v-list-item-title {
  color: #fff !important;
}
</style>