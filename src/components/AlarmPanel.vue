<!-- Panel de alarmas (componente simple y dialog para aceptar alarmas) -->
<template>
  <div>
    <v-badge :content="count" color="red" v-if="count>0">
      <v-btn icon rounded @click="open = true"><v-icon>mdi-bell</v-icon></v-btn>
    </v-badge>

    <v-dialog v-model="open" width="600">
      <v-card>
        <v-card-title>Alarmas</v-card-title>
        <v-card-text>
          <div v-if="alarms.length === 0">No hay alarmas activas.</div>
          <v-list v-else>
            <v-list-item v-for="a in alarms" :key="a.id">
              <v-list-item-title>Orden: {{ a.number }} ({{ a.id }})</v-list-item-title>
              <v-list-item-subtitle>Temperatura: {{ a.lastTemp }} °C</v-list-item-subtitle>
              <v-list-item-action>
                <v-btn small color="green" @click="accept(a.id)">Aceptar</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="open=false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { acceptAlarm } from '@/services/ordersService.js';
import { useOrders } from '@/composables/useOrders.js';

const open = ref(false);
const { orders } = useOrders();

const alarms = computed(() => orders.value.filter(o => (o.lastTemp ?? 0) > 18 && o.status === 'LOADING'));
const count = computed(() => alarms.value.length);

async function accept(orderId) {
  await acceptAlarm(orderId, { user: 'operator@example.com', observation: 'Aceptada desde UI' });
}
</script>