<template>
  <cargo-layout>
    <v-container>
    <h2 class="mb-4">Alarmas</h2>

    <!-- Pending alarms -->
    <v-card class="pa-4 mb-6 monitoring-card" elevation="6">
  <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h4 class="mb-1">Alarmas Pendientes</h4>
          <div class="caption">Alarmas generadas por órdenes en proceso. Acepta para registrar quien atendió la alarma.</div>
        </div>
        <v-badge :content="(pending && pending.value && pending.value.length) || 0" color="red" v-if="(pending && pending.value && pending.value.length) > 0" />
      </div>

      <div v-if="!(pending && pending.value && pending.value.length) || pending.value.length === 0">
        <v-alert type="info">No hay alarmas pendientes.</v-alert>
      </div>

      <v-row v-else dense>
        <v-col cols="12" v-for="a in (pending && pending.value) || []" :key="a.id">
          <v-sheet class="alarm-card pa-4 d-flex align-center justify-space-between">
            <div>
              <div class="d-flex align-center mb-2">
                <v-icon color="red" class="me-2">mdi-alert-circle</v-icon>
                <div class="font-weight-medium">{{ a.title }}</div>
              </div>
              <div class="caption mb-1">
                Orden: <strong class="order-link">{{ a.orderNumber }}</strong>
                <span class="mx-2">•</span>
                <v-icon small class="me-1">mdi-clock-outline</v-icon>
                {{ formatDate(a.at) }}
              </div>
              <div class="muted">{{ a.description }}</div>
            </div>

            <div class="d-flex flex-column align-end" style="min-width:140px;">
              <v-btn color="orange" dark @click="openAccept(a)">Aceptar</v-btn>
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>

    <!-- Accepted alarms -->
    <v-card class="pa-4 monitoring-card" elevation="6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h4 class="mb-1">Alarmas Aceptadas</h4>
          <div class="caption">Registro de alarmas ya atendidas</div>
        </div>
        <v-badge :content="(accepted && accepted.value && accepted.value.length) || 0" color="green" v-if="(accepted && accepted.value && accepted.value.length) > 0" />
      </div>

      <div v-if="!(accepted && accepted.value && accepted.value.length) || accepted.value.length === 0" class="py-8 text-center muted">No hay alarmas aceptadas</div>

      <v-list v-else two-line>
        <v-list-item v-for="a in (accepted && accepted.value) || []" :key="a.id">
          <v-list-item-content>
            <v-list-item-title class="font-weight-medium">{{ a.title }} — {{ a.orderNumber }}</v-list-item-title>
            <v-list-item-subtitle>
              Aceptada por <strong>{{ a.handledBy }}</strong> el {{ formatDate(a.handledAt) }}
              <div v-if="a.observation" class="mt-1 muted">Observación: {{ a.observation }}</div>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Accept dialog -->
    <v-dialog v-model="dialog" width="560" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <div class="headline">Aceptar Alarma</div>
            <div class="caption">{{ selected?.title }}</div>
          </div>
          <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-card-text>
          <div class="mb-3">
            <strong>Orden:</strong> <span class="order-link">{{ selected?.orderNumber }}</span>
            <span class="mx-2">•</span>
            <small class="muted">{{ formatDate(selected?.at) }}</small>
          </div>

          <v-textarea
            v-model="observation"
            label="Observación (opcional)"
            placeholder="Ingresa una observación sobre esta alarma..."
            rows="4"
            auto-grow
            outlined
            dense
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn text @click="closeDialog">Cancelar</v-btn>
          <v-btn color="orange" dark :loading="loading" @click="confirmAccept">Confirmar Aceptación</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </v-container>
  </cargo-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAlarms } from '@/composables/useAlarms.js';
import { useAuth } from '@/composables/useAuth.js';
import * as service from '@/services/alarmsService.js';
import CargoLayout from '@/layouts/CargoLayout.vue';

const { pending, accepted, load } = useAlarms();
const dialog = ref(false);
const selected = ref(null);
const observation = ref('');
const loading = ref(false);

const { user } = useAuth();

onMounted(() => {
  load();
});

function openAccept(a) {
  selected.value = a;
  observation.value = '';
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  selected.value = null;
  observation.value = '';
}

async function confirmAccept() {
  if (!selected.value) return;
  loading.value = true;
  try {
    await service.acceptAlarm(selected.value.id, {
      user: user.value?.username ?? 'anonymous',
      observation: observation.value || undefined
    });
    // recargar listas
    await load();
    closeDialog();
  } catch (e) {
    console.error(e);
    alert('Error aceptando la alarma');
  } finally {
    loading.value = false;
  }
}

function formatDate(iso) {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleString();
}
</script>

<style scoped>
h2 { color: #fff; }
.monitoring-card { background: rgba(8,16,26,0.6); color: #fff; border-radius: 12px; border: 1px solid rgba(255,255,255,0.04); }
.caption { color: rgba(255,255,255,0.65); }
.muted { color: rgba(255,255,255,0.45); }
.alarm-card {
  border-radius: 8px;
  border: 1px solid rgba(255, 80, 80, 0.12);
  background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.02));
}
.order-link { color: #ffb94d; font-weight: 700; text-decoration: none; }
.v-dialog .v-card { background: rgba(6,12,20,0.9); color: #fff; }
</style>