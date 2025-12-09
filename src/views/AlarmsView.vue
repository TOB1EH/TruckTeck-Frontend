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
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="ma-0">Alarmas</h2>
      <v-icon 
        style="margin-right: 0.4rem;"
        color="grey-lighten-1" 
        class="cursor-pointer" 
        @click="openConfig"
        title="Configurar alarmas">
        mdi-cog
      </v-icon>
    </div>

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
          Icono de configuración y Badge de alarmas pendientes
        -->
        
          <v-badge :content="pending.length" color="red" v-if="pending.length > 0" />
      </div>

      <!-- Mensaje cuando NO hay alarmas pendientes -->
      <div v-if="pending.length === 0">
        <v-alert type="info">No hay alarmas pendientes.</v-alert>
      </div>

      <!-- Listado de alarmas pendientes -->
      <v-row v-else dense>
        <!--
          Iteración de cada alarma pendiente.
          Cada alarma se renderiza como una tarjeta independiente.
        -->
        <v-col cols="12" v-for="a in pending" :key="a.id">
          <v-sheet class="alarm-card pa-4 d-flex align-center justify-space-between">
            <div>

              <!-- Título e icono de alerta -->
              <div class="d-flex align-center mb-2">
                <v-icon color="red" class="me-2">mdi-alert-circle</v-icon>
                <div class="font-weight-medium titleAlert">{{ a.title }}</div>
              </div>
              
              <!-- Información contextual: número de orden y fecha -->
              <div class="caption mb-1">
                Orden: <strong class="order-link">{{ a.orderNumber }}</strong>
                <span class="mx-2">•</span>
                <v-icon small class="me-1">mdi-clock-outline</v-icon>
                {{ formatDate(a.eventDateTime) }}
              </div>

              <!-- Descripción de la alarma con temperaturas -->
              <div class="muted">Temp. actual: {{ a.currentTemperature }}°C — Umbral: {{ a.thresholdTemperature }}°C</div>
            </div>

            <!-- Botón para aceptar la alarma -->
            <div class="d-flex flex-column align-end" style="min-width:140px;">
              <v-btn class="btnAlarm" color="orange" dark @click="openAccept(a)">Aceptar</v-btn>
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
        <v-badge :content="accepted.length" color="green" v-if="accepted.length > 0" />

      </div>

      <!-- Si no hay alarmas aceptadas -->
      <div v-if="accepted.length === 0" class="py-8 text-center muted">No hay alarmas aceptadas</div>

      <!-- Listado de alarmas ya aceptadas -->
      <v-list v-else lines="two" class="accepted-list">
        <v-list-item v-for="a in accepted" :key="a.id">
          <v-list-item-title class="font-weight-medium">
            {{ a.title }} — {{ a.orderNumber }}
          </v-list-item-title>

          <!-- Detalles de la aceptación -->
          <v-list-item-subtitle>
            Aceptada
            <div class="mt-1 muted">
              Temp: {{ a.currentTemperature }}°C — Umbral: {{ a.thresholdTemperature }}°C — Fecha: {{ formatDate(a.eventDateTime) }}
            </div>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- ========================================================= -->
    <!-- DIÁLOGO PARA ACEPTAR UNA ALARMA                          -->
    <!-- ========================================================= -->
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card class="dialog-card">
        <!-- Cabecera del cuadro de diálogo -->
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <div class="text-h5">Aceptar Alarma</div>
            <div class="caption mt-1">Temperatura fuera de rango: {{ selected?.currentTemperature }}°C</div>
          </div>
          <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Contenido principal -->
        <v-card-text class="pt-4">
          <!-- Información de la alarma -->
          <div class="mb-4 alarm-info-section">
            <div class="d-flex align-center mb-2">
              <v-icon color="orange" class="me-2">mdi-alert-circle</v-icon>
              <strong>Orden: {{ selected?.orderNumber }}</strong>
              <span class="mx-2">•</span>
              <small class="muted">{{ formatDate(selected?.eventDateTime) }}</small>
            </div>
            <div class="text-caption text-grey">
              Umbral configurado: {{ selected?.thresholdTemperature }}°C
            </div>
          </div>

          <!-- Pregunta de confirmación -->
          <div class="mb-3 text-body-2">
            ¿Está seguro que desea aceptar esta alarma?
          </div>

          <!-- Label para observación -->
          <div class="text-caption mb-2" style="color: rgba(255, 255, 255, 0.7);">
            <strong>Observación (opcional)</strong>
          </div>

          <!-- Campo de observación -->
          <v-textarea
            v-model="observation"
            placeholder="Ingresa una observación sobre esta alarma..."
            rows="4"
            variant="outlined"
            counter
            maxlength="500"
            hint="Describe la situación o acciones tomadas"
            persistent-placeholder
            hide-details="auto"
          ></v-textarea>
        </v-card-text>

        <v-divider></v-divider>

        <!-- Acciones del popup -->
        <v-card-actions class="pa-4 justify-end">
          <v-btn variant="outlined" @click="closeDialog" :disabled="loading">Cancelar</v-btn>
          <v-btn color="orange" variant="flat" :loading="loading" @click="confirmAccept">
            Confirmar Aceptación
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================================= -->
    <!-- DIÁLOGO PARA CONFIGURAR ALARMAS                          -->
    <!-- ========================================================= -->
    <v-dialog v-model="configDialog" width="560" persistent>
      <v-card class="dialog-card">
        <!-- Cabecera del cuadro de diálogo -->
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <div class="text-h5">Configuración de Alarmas</div>
            <div class="caption">Ajustar umbral de temperatura y emails</div>
          </div>
          <v-btn icon @click="closeConfigDialog"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <!-- Contenido principal -->
        <v-card-text>
          <!-- Campo para umbral de temperatura -->
          <v-text-field
            v-model.number="configThreshold"
            label="Umbral de temperatura (°C)"
            type="number"
            step="0.1"
            variant="outlined"
            class="mb-4"
            :rules="[
              v => v !== null && v !== undefined && v !== '' || 'El umbral es requerido',
              v => v > 0 || 'El umbral debe ser mayor a 0'
            ]"
          />

          <!-- Campo para emails separados por comas -->
          <v-textarea
            v-model="configEmails"
            label="Emails (separados por comas)"
            variant="outlined"
            placeholder="&#10;ejemplo1@mail.com, ejemplo2@mail.com"
            rows="3"
            :rules="[
              v => !!v || 'Debe ingresar al menos un email',
              v => validateEmails(v)
            ]"
          />

          <div class="caption">
            Los emails ingresados recibirán notificaciones cuando se genere una alarma.
          </div>
        </v-card-text>

        <!-- Acciones del popup -->
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closeConfigDialog">Cancelar</v-btn>
          <v-btn color="primary" :loading="configLoading" @click="confirmConfig">Guardar Configuración</v-btn>
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
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useAlarms } from '@/composables/useAlarms.js';
  import { useAuth } from '@/composables/useAuth.js';
  import CargoLayout from '@/layouts/CargoLayout.vue';

  /* 
  useAlarms() expone:
  - pendingAlarms: lista de alarmas pendientes
  - acceptedAlarms: lista de alarmas aceptadas
  - load(): carga ambas listas desde el backend
  - accept(): acepta una alarma
  - updateConfig(): actualiza configuración global
  */
  const { pendingAlarms, acceptedAlarms, load, accept, updateConfig } = useAlarms();
  
  // Alias para mantener compatibilidad con el template
  const pending = pendingAlarms;
  const accepted = acceptedAlarms;

  /* Estado del diálogo de aceptación y variables de trabajo */
  const dialog = ref(false);
  const selected = ref(null);
  const observation = ref('');
  const loading = ref(false);

  /* Estado del diálogo de configuración */
  const configDialog = ref(false);
  const configThreshold = ref('');
  const configEmails = ref('');
  const configLoading = ref(false);

  /* Usuario autenticado */
  const { user, getUserId } = useAuth();

  /* Intervalo para recargar alarmas cada 10 segundos */
  let intervalId = null;

  /* Cargar alarmas al montar la vista */
  onMounted(() => {
    load(); // Carga inicial
    // Configurar intervalo de 10 segundos
    intervalId = setInterval(() => {
      load();
    }, 10000); // 10000 ms = 10 segundos
  });

  /* Limpiar intervalo al desmontar el componente */
  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
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
    Incluye ID de usuario y observación opcional.
  */
  async function confirmAccept() {
    if (!selected.value) return;
    
    loading.value = true;
    try {
      // Obtener ID del usuario autenticado
      const userId = getUserId();
      
      if (!userId) {
        alert('No se pudo obtener el ID del usuario autenticado');
        return;
      }

      // Llamar al servicio con el nuevo formato
      await accept(selected.value.id, userId, observation.value.trim());
      
      closeDialog();
      
      // Recargar alarmas después de aceptar
      await load();
    } catch (e) {
      console.error('Error aceptando la alarma:', e);
      alert('Error aceptando la alarma: ' + (e.message || 'Error desconocido'));
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

  /*
    Abre el diálogo de configuración de alarmas.
  */
  function openConfig() {
    configDialog.value = true;
  }

  /*
    Cierra el diálogo de configuración.
  */
  function closeConfigDialog() {
    configDialog.value = false;
  }

  /*
    Valida que los emails estén bien formados y separados por coma.
    Acepta un email o múltiples emails separados por comas.
  */
  function validateEmails(emailString) {
    if (!emailString || emailString.trim().length === 0) {
      return 'Debe ingresar al menos un email';
    }

    // Regex más permisivo pero que valida formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Separar por comas y limpiar espacios
    const emails = emailString
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    // Validar que haya al menos un email
    if (emails.length === 0) {
      return 'Debe ingresar al menos un email válido';
    }

    // Validar cada email
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return `"${email}" no es un email válido. Formato esperado: usuario@dominio.com`;
      }
    }

    // Si todo es válido
    return true;
  }

  /*
    Envía al backend la actualización de configuración (umbral y emails).
  */
  async function confirmConfig() {
    configLoading.value = true;
    try {
      // Validar que el umbral esté completo
      if (!configThreshold.value || configThreshold.value === '' || configThreshold.value <= 0) {
        alert('Debe ingresar un umbral de temperatura válido (mayor a 0)');
        configLoading.value = false;
        return;
      }

      // Convertir string de emails separados por comas a array
      const emailsArray = configEmails.value
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      if (emailsArray.length === 0) {
        alert('Debe ingresar al menos un email');
        configLoading.value = false;
        return;
      }

      await updateConfig({
        threshold: parseFloat(configThreshold.value),
        emails: emailsArray
      });

      alert('Configuración actualizada exitosamente');
      closeConfigDialog();
    } catch (e) {
      console.error(e);
      alert('Error actualizando la configuración');
    } finally {
      configLoading.value = false;
    }
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

  /* Gap para elementos flex */
  .gap-3 {
    gap: 12px;
  }

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

  .titleAlert {
    color: white;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  :deep(.btnAlarm) {
  transition: background-color 0.25s ease, transform 0.2s ease;
  }

  :deep(.btnAlarm:hover) {
    background-color: #d46f00 !important; /* tono más oscuro del naranja */
    transform: scale(1.04);               /* pequeño aumento visual */
    cursor: pointer;
  }

  /* Estilos para el campo de observación */
  .alarm-info-section {
    background: rgba(255, 255, 255, 0.03);
    padding: 12px;
    border-radius: 8px;
    border-left: 3px solid #ff9800;
  }

  :deep(.v-textarea) {
    color: #fff;
  }

  :deep(.v-textarea .v-field) {
    background: rgba(255, 255, 255, 0.05);
  }

  :deep(.v-textarea .v-field__input) {
    color: #fff;
  }

  :deep(.v-textarea .v-label) {
    color: rgba(255, 255, 255, 0.7);
  }

  :deep(.v-textarea .v-field__outline) {
    color: rgba(255, 255, 255, 0.3);
  }

  :deep(.v-textarea:hover .v-field__outline) {
    color: rgba(255, 255, 255, 0.5);
  }

  :deep(.v-textarea .v-field--focused .v-field__outline) {
    color: #ff9800;
  }

  :deep(.v-textarea .v-counter) {
    color: rgba(255, 255, 255, 0.5);
  }

  :deep(.v-textarea .v-messages__message) {
    color: rgba(255, 255, 255, 0.6);
  }
</style>