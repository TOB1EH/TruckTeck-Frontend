<!-- Componente OrdersTable (tabla con progress, chips, columnas solicitadas) -->
<template>
  <v-data-table
    :items="orders"
    class="orders-table"
    hide-default-footer
    :dense="true"
  >
    <template #item.number="{ item }">
      <div class="order-number">{{ item.number }}</div>
    </template>

    <template #item.status="{ item }">
      <v-chip :color="statusColor(item.status)" small dark>{{ item.status }}</v-chip>
    </template>

    <template #item.progress="{ item }">
      <div style="min-width:160px;">
        <v-progress-linear :value="progressPercent(item)" height="10" rounded color="rgba(255,255,255,0.12)"/>
        <div class="caption mt-1">{{ progressPercent(item).toFixed(1) }}%</div>
      </div>
    </template>

    <template #item.preset="{ item }">
      {{ item.preset.toLocaleString() }}
    </template>

    <template #item.accumulated="{ item }">
      {{ item.accumulated.toLocaleString(undefined, {maximumFractionDigits:3}) }}
    </template>

    <template #item.lastTemp="{ item }">
      <v-icon small class="mr-1" color="orange">mdi-thermometer</v-icon>{{ item.lastTemp }}
    </template>

    <template #item.density="{ item }">
      <v-icon small class="mr-1" color="blue">mdi-water</v-icon>{{ item.density }}
    </template>

    <template #item.flow="{ item }">
      <v-icon small class="mr-1" color="green">mdi-swap-vertical</v-icon>{{ formatFlow(item.flow) }}
    </template>

    <template #item.eta="{ item }">
      <div v-if="item.etaMinutes !== null">{{ humanETA(item.etaMinutes) }}</div>
      <div v-else class="muted">--</div>
    </template>

    <template #item.elapsed="{ item }">
      <div v-if="item.elapsedMinutes !== null">{{ Math.floor(item.elapsedMinutes) }}m</div>
      <div v-else class="muted">--</div>
    </template>

    <template #no-data>
      <v-alert type="info">No hay órdenes que coincidan.</v-alert>
    </template>
  </v-data-table>
</template>

<script setup>
// runtime props (no TypeScript)
const props = defineProps({ orders: { type: Array, required: true } });

function progressPercent(o) {
  return Math.min(100, (o.accumulated / o.preset) * 100);
}

function statusColor(s) {
  if (s === 'LOADING') return 'orange darken-2';
  if (s === 'TARA_REGISTERED') return 'blue darken-2';
  if (s === 'FINALIZED') return 'green darken-2';
  return 'grey';
}

function formatFlow(f) {
  if (!f) return '0';
  return f.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function humanETA(mins) {
  if (mins == null) return '--';
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = Math.floor(mins/60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}
</script>

<style scoped>
.orders-table {
  color: #fff;
}
.order-number { color: #ffb94d; font-weight: 700; }
.muted { color: rgba(255,255,255,0.35) }
.caption { color: rgba(255,255,255,0.6) }
</style>