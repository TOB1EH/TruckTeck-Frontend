<template>
  <v-container>
    <h2 class="mb-4">Conciliación</h2>

    <v-card class="pa-4 mb-6 monitoring-card" elevation="6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h4 class="mb-1">Consultar Conciliación</h4>
          <div class="caption">Selecciona una orden finalizada para consultar los resultados de conciliación.</div>
        </div>
      </div>

      <v-row>
        <v-col cols="12" md="9">
          <v-select
            v-model="selected"
            :items="orderOptions"
            item-title="label"
            item-value="number"
            label="Selecciona una orden finalizada"
            dense
            hide-details
            clearable
          />
        </v-col>

        <v-col cols="12" md="3" class="d-flex align-center">
          <v-btn color="orange" :disabled="!selected" @click="onConsult">Consultar</v-btn>
        </v-col>
      </v-row>

      <div class="mt-3 muted small">GET /api/v1/orders/number/{number}/conciliation</div>
    </v-card>

    <v-card v-if="conciliation" class="pa-6 monitoring-card" elevation="6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h4 class="mb-1">Conciliación: {{ conciliation.number }} <small class="muted">- {{ conciliation.truck }}</small></h4>
          <div class="caption">Resultado de conciliación</div>
        </div>
        <v-chip color="green" small text-color="white">FINALIZADA</v-chip>
      </div>

      <v-row class="g-4">
        <v-col cols="12" md="3">
          <v-card class="metric-card pa-4" elevation="0">
            <div class="metric-title"><v-icon left color="blue darken-2">mdi-scale-bathroom</v-icon> Peso Inicial (Tara)</div>
            <div class="metric-value">{{ conciliation.presetKg?.toLocaleString() }} kg</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="metric-card pa-4" elevation="0">
            <div class="metric-title"><v-icon left color="green darken-2">mdi-scale-bathroom</v-icon> Peso Final</div>
            <div class="metric-value">{{ conciliation.finalKg?.toLocaleString() }} kg</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="metric-card metric-highlight pa-4" elevation="0">
            <div class="metric-title"><v-icon left color="amber darken-2">mdi-weight-kilogram</v-icon> Peso Neto</div>
            <div class="metric-value highlight">{{ conciliation.netKg?.toLocaleString() }} kg</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="metric-card pa-4" elevation="0">
            <div class="metric-title"><v-icon left color="purple">mdi-chart-line-variant</v-icon> Diferencia (Balanza vs Caudalímetro)</div>
            <div class="metric-value">{{ conciliation.differenceKg }} kg</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="metric-card pa-4" elevation="0">
            <div class="metric-title"><v-icon left color="orange">mdi-thermometer</v-icon> Temperatura Promedio</div>
            <div class="metric-value">{{ conciliation.temperatureC }} °C</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="metric-card pa-4" elevation="0">
            <div class="metric-title"><v-icon left color="blue">mdi-water</v-icon> Densidad Promedio</div>
            <div class="metric-value">{{ conciliation.density }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="metric-card pa-4" elevation="0">
            <div class="metric-title"><v-icon left color="green">mdi-swap-vertical</v-icon> Caudal Promedio</div>
            <div class="metric-value">{{ conciliation.avgFlowKgPerHour.toLocaleString() }} kg/h</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getFinalizedOrders, getConciliation } from '@/services/conciliationService';

type OrderOption = { number: string; label: string };

const orderOptions = ref<OrderOption[]>([]);
const selected = ref<string | null>(null);
const conciliation = ref<null | Awaited<ReturnType<typeof getConciliation>>>(null);

onMounted(async () => {
  const list = await getFinalizedOrders();
  // list now returns objects { number, label } (service mock)
  orderOptions.value = list.map((o: any) => ({ number: o.number, label: o.label }));
});

async function onConsult() {
  if (!selected.value) return;
  conciliation.value = null;
  conciliation.value = await getConciliation(selected.value);
}
</script>

<style scoped>
.monitoring-card { background: rgba(8,16,26,0.6); color: #fff; border-radius: 12px; border: 1px solid rgba(255,255,255,0.04); }
.caption { color: rgba(255,255,255,0.65); }
.muted { color: rgba(255,255,255,0.45); }
.metric-card { background: rgba(10,18,30,0.45); border-radius: 10px; border: 1px solid rgba(255,255,255,0.04); color: #fff; min-height: 88px; }
.metric-title { color: rgba(255,255,255,0.75); font-size: 0.9rem; display: flex; align-items: center; gap:8px; }
.metric-value { font-size: 1.6rem; font-weight: 700; margin-top: 6px; color: #e6eef6; }
.metric-highlight { border: 1px solid rgba(255, 180, 60, 0.16); }
.metric-value.highlight { color: #ffb94d; }
h2 { color: #fff; }
</style>