<template>
  <!--
    Vista principal de Alarmas.  
    Se encapsula dentro del layout general <cargo-layout>,
    lo que garantiza que esta pantalla mantenga la estructura visual 
    global de la aplicación (sidebar, header, etc.).
  -->
  <cargo-layout>
    <v-container>

    <!-- Título principal de la vista -->
    <h2 class="mb-4">Alarmas</h2>

    <!-- ========================================================= -->
    <!-- BLOQUE 1 — ALARMAS PENDIENTES                            -->
    <!-- ========================================================= -->
    <v-card class="pa-4 mb-6 monitoring-card" elevation="6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h4 class="mb-1">Alarmas Pendientes</h4>
          <div class="caption">Alarmas generadas por órdenes en proceso. Acepta para registrar quien atendió la alarma.</div>
        </div>

        <!--
          Badge que muestra la cantidad de alarmas pendientes.
          Solo se renderiza si existe al menos una alarma.
        -->
        <v-badge :content="(pending && pending.value && pending.value.length) || 0" color="red" v-if="(pending && pending.value && pending.value.length) > 0" />
      </div>

      <!-- Mensaje cuando NO hay alarmas pendientes -->
      <div v-if="!(pending && pending.value && pending.value.length) || pending.value.length === 0">
        <v-alert type="info">No hay alarmas pendientes.</v-alert>
      </div>

      <!-- Listado de alarmas pendientes -->
      <v-row v-else dense>
        <!--
          Iteración de cada alarma pendiente.
          Cada alarma se renderiza como una tarjeta independiente.
        -->
        <v-col cols="12" v-for="a in (pending && pending.value) || []" :key="a.id">
          <v-sheet class="alarm-card pa-4 d-flex align-center justify-space-between">
            <div>

              <!-- Título e icono de alerta -->
              <div class="d-flex align-center mb-2">
                <v-icon color="red" class="me-2">mdi-alert-circle</v-icon>
                <div class="font-weight-medium">{{ a.title }}</div>
              </div>
              
              <!-- Información contextual: número de orden y fecha -->
              <div class="caption mb-1">
                Orden: <strong class="order-link">{{ a.orderNumber }}</strong>
                <span class="mx-2">•</span>
                <v-icon small class="me-1">mdi-clock-outline</v-icon>
                {{ formatDate(a.at) }}
              </div>

              <!-- Descripción de la alarma -->
              <div class="muted">{{ a.description }}</div>
            </div>

            <!-- Botón para aceptar la alarma -->
            <div class="d-flex flex-column align-end" style="min-width:140px;">
              <v-btn color="orange" dark @click="openAccept(a)">Aceptar</v-btn>
            </div>

          </v-sheet>
        </v-col>
      </v-row>
    </v-card>

    <!-- ========================================================= -->
    <!-- BLOQUE 2 — ALARMAS ACEPTADAS                             -->
    <!-- ========================================================= -->
    <v-card class="pa-4 monitoring-card" elevation="6">
      <!-- Cabecera del bloque -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h4 class="mb-1">Alarmas Aceptadas</h4>
          <div class="caption">Registro de alarmas ya atendidas</div>
        </div>

        <!-- Badge con el total de alarmas aceptadas -->        
        <v-badge :content="(accepted && accepted.value && accepted.value.length) || 0" color="green" v-if="(accepted && accepted.value && accepted.value.length) > 0" />

      </div>

      <!-- Si no hay alarmas aceptadas -->
      <div v-if="!(accepted && accepted.value && accepted.value.length) || accepted.value.length === 0" class="py-8 text-center muted">No hay alarmas aceptadas</div>

      <!-- Listado de alarmas ya aceptadas -->
      <v-list v-else lines="two" class="accepted-list">
        <v-list-item v-for="a in (accepted && accepted.value) || []" :key="a.id">
          <v-list-item-title class="font-weight-medium">
            {{ a.title }} — {{ a.orderNumber }}
          </v-list-item-title>

          <!-- Detalles de la aceptación -->
          <v-list-item-subtitle>
            Aceptada por <strong>{{ a.handledBy }}</strong> el {{ formatDate(a.handledAt) }}

            <!-- Observación opcional -->
            <div v-if="a.observation" class="mt-1 muted">Observación: {{ a.observation }}</div>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- ========================================================= -->
    <!-- DIÁLOGO PARA ACEPTAR UNA ALARMA                          -->
    <!-- ========================================================= -->
    <v-dialog v-model="dialog" width="560" persistent>
      <v-card class="dialog-card">
        <!-- Cabecera del cuadro de diálogo -->
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <div class="text-h5">Aceptar Alarma</div>
            <div class="caption">{{ selected?.title }}</div>
          </div>
          <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <!-- Contenido principal -->
        <v-card-text>
          <div class="mb-3">
            <strong>Orden:</strong> <span class="order-link">{{ selected?.orderNumber }}</span>
            <span class="mx-2">•</span>
            <small class="muted">{{ formatDate(selected?.at) }}</small>
          </div>

          <!-- Campo para ingresar observación opcional -->
          <v-textarea
            v-model="observation"
            label="Observación (opcional)"
            placeholder="Ingresa una observación sobre esta alarma..."
            rows="4"
            auto-grow
            variant="outlined"
            density="compact"
          />
        </v-card-text>

        <!-- Acciones del popup -->
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="orange" :loading="loading" @click="confirmAccept">Confirmar Aceptación</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </v-container>
  </cargo-layout>
</template>

<script setup>
  /*
  Script de la vista de Alarmas.
  Utiliza composables para obtener las alarmas pendientes/aceptadas,
  y gestionar autenticación y servicios asociados.
  */
  import { ref, onMounted } from 'vue';
  import { useAlarms } from '@/composables/useAlarms.js';
  import { useAuth } from '@/composables/useAuth.js';
  import * as service from '@/services/alarmsService.js';
  import CargoLayout from '@/layouts/CargoLayout.vue';

  /* 
  useAlarms() expone:
  - pending: lista de alarmas pendientes
  - accepted: lista de alarmas aceptadas
  - load(): carga ambas listas desde el backend
  */
  const { pending, accepted, load } = useAlarms();

  /* Estado del diálogo y variables de trabajo */
  const dialog = ref(false);
  const selected = ref(null);
  const observation = ref('');
  const loading = ref(false);

  /* Usuario autenticado */
  const { user } = useAuth();

  /* Cargar alarmas al montar la vista */
  onMounted(() => {
    load();
  });

  /*
    Abre el diálogo para aceptar una alarma específica.
  */
  function openAccept(a) {
    selected.value = a;
    observation.value = '';
    dialog.value = true;
  }

  /*
    Cierra el diálogo y resetea estado.
  */
  function closeDialog() {
    dialog.value = false;
    selected.value = null;
    observation.value = '';
  }

  /*
    Envía al backend la aceptación de la alarma seleccionada.
    Incluye usuario y observación opcional.
  */
  async function confirmAccept() {
    if (!selected.value) return;
    loading.value = true;
    try {

      await service.acceptAlarm(selected.value.id, {
        user: user.value?.username ?? 'anonymous',
        observation: observation.value || undefined
      });
      
      // Recargar datos tras aceptar la alarma
      await load();
      closeDialog();

    } catch (e) {
      console.error(e);
      alert('Error aceptando la alarma');
    } finally {
      loading.value = false;
    }
  }

  /*
    Formateo seguro de fechas ISO a formato local.
  */
  function formatDate(iso) {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleString();
  }
</script>

<style scoped>

  h2 { color: #fff; }

  /* Estilo general de las tarjetas de la vista */
  .monitoring-card { 
    background: rgba(8,16,26,0.6); 
    color: #fff; 
    border-radius: 12px; 
    border: 1px solid rgba(255,255,255,0.04); 
  }

  /* Colores secundarios */
  .caption { color: rgba(255,255,255,0.65); }
  .muted { color: rgba(255,255,255,0.45); }

  /* Tarjeta individual de alarma pendiente */
  .alarm-card {
    border-radius: 8px;
    border: 1px solid rgba(255, 80, 80, 0.12);
    background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.02));
  }
  
  .order-link { color: #ffb94d; font-weight: 700; text-decoration: none; }

  /* Estilos para el diálogo */
  .dialog-card { 
    background: rgba(6,12,20,0.95) !important; 
    color: #fff; 
  }

  /* Estilos para la lista de alarmas aceptadas */
  .accepted-list {
    background: transparent !important;
  }

  .accepted-list :deep(.v-list-item) {
    background: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .accepted-list :deep(.v-list-item:hover) {
    background: rgba(255, 255, 255, 0.05) !important;
  }

  .accepted-list :deep(.v-list-item-title) {
    color: #fff !important;
  }

  .accepted-list :deep(.v-list-item-subtitle) {
    color: rgba(255, 255, 255, 0.7) !important;
  }
</style>