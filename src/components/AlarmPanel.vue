<!--
  Componente: Panel de Alarmas (componente simple y dialog para aceptar alarmas)
  Descripción:
    • Muestra un ícono de campana con un badge indicando la cantidad de alarmas activas.
    • Al hacer clic, despliega un diálogo que lista las alarmas detectadas.
    • Permite aceptar una alarma enviando observación al backend.
    • Las alarmas se derivan de órdenes cuyo estado es LOADING y temperatura > 18°C.

  Dependencias:
    • useOrders() – Obtiene las órdenes activas en el sistema.
    • useAuth() - Obtiene el ID del usuario autenticado.
    • acceptAlarm() – Servicio para resetear la alarma.
-->
<template>
  <div>
    <!--
      Ícono de campana con badge rojo:
      • El badge muestra la cantidad total de alarmas activas.
      • Solo se renderiza cuando count > 0.
    -->
    <v-badge :content="count" color="red" v-if="count>0">
      <v-btn icon rounded @click="open = true"><v-icon>mdi-bell</v-icon></v-btn>
    </v-badge>

    <!--
      Diálogo que despliega la lista de alarmas activas.
      • Se abre al presionar el ícono de campana.
      • width=600 define un ancho cómodo para lectura.
    -->
    <v-dialog v-model="open" width="600">
      <v-card>

        <!-- Título principal del panel -->
        <v-card-title>Alarmas</v-card-title>

        <v-card-text>
          <!-- Mensaje cuando no existen alarmas activas -->
          <div v-if="alarms.length === 0">No hay alarmas activas.</div>

          <!-- Listado de alarmas -->
          <v-list v-else>
            <!--
              Cada ítem de la lista representa una alarma:
                • Muestra número de orden e ID de alarma.
                • Muestra última temperatura registrada.
                • Incluye botón para aceptar la alarma.
            -->
            <v-list-item v-for="a in alarms" :key="a.id">
              <v-list-item-title>Orden: {{ a.number }} ({{ a.id }})</v-list-item-title>
              <v-list-item-subtitle>Temperatura: {{ a.lastTemp }} °C</v-list-item-subtitle>
              <v-list-item-action>
                <v-btn small color="green" @click="openAcceptDialog(a)">Aceptar</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>

        <!-- Acciones inferiores -->
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="open=false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para aceptar alarma con observación -->
    <v-dialog v-model="acceptDialog" max-width="600" persistent>
      <v-card class="accept-alarm-card">
        <!-- Header -->
        <v-card-title class="d-flex align-items-center justify-space-between">
          <span>Aceptar Alarma</span>
          <v-btn icon="mdi-close" variant="text" @click="closeAcceptDialog"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <!-- Información de la alarma -->
          <div v-if="selectedAlarm" class="mb-4">
            <div class="alarm-info">
              <v-icon color="orange" class="mr-2">mdi-alert-circle</v-icon>
              <span class="alarm-temp">Temperatura fuera de rango: {{ selectedAlarm.lastTemp }}°C</span>
            </div>
            <div class="text-caption mt-2 text-grey">
              Orden: {{ selectedAlarm.number }} | ID: {{ selectedAlarm.id }}
            </div>
          </div>

          <!-- Campo de observación -->
          <v-textarea
            v-model="observation"
            label="Observación (opcional)"
            placeholder="Ingresa una observación sobre esta alarma..."
            rows="4"
            variant="outlined"
            counter
            maxlength="500"
            hint="Describe la situación o acciones tomadas"
          ></v-textarea>

          <!-- Mensaje de error si existe -->
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4" closable @click:close="errorMessage = null">
            {{ errorMessage }}
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <!-- Acciones -->
        <v-card-actions class="pa-4">
          <v-btn variant="outlined" @click="closeAcceptDialog" :disabled="loading">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="orange" variant="flat" @click="confirmAccept" :loading="loading">
            Confirmar Aceptación
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  /*
  Script del componente
  ---------------------
  • open: controla si el diálogo de lista de alarmas está visible.
  • acceptDialog: controla si el diálogo de aceptación está visible.
  • selectedAlarm: alarma seleccionada para aceptar.
  • observation: texto de observación del usuario.
  • loading: indica si se está procesando la aceptación.
  • errorMessage: mensaje de error si la operación falla.
  • orders: listado de órdenes proveniente del composable useOrders().
  • alarms: alarmas filtradas según criterios de riesgo.
  • count: cantidad total de alarmas activas.
  • getUserId: función para obtener el ID del usuario autenticado.
  • accept(): envía la acción de aceptación al backend con observación.
  */
  import { ref, computed } from 'vue';
  import { acceptAlarm } from '@/services/alarmsService.js';
  import { useOrders } from '@/composables/useOrders.js';
  import { useAuth } from '@/composables/useAuth.js';

  const open = ref(false);
  const acceptDialog = ref(false);
  const selectedAlarm = ref(null);
  const observation = ref('');
  const loading = ref(false);
  const errorMessage = ref(null);

  /*
  useOrders():
    • Provee todas las órdenes disponibles.
    • Las alarmas se determinan evaluando temperatura y estado.
  */
  const { orders } = useOrders();

  /*
  useAuth():
    • Provee la función para obtener el ID del usuario autenticado.
  */
  const { getUserId } = useAuth();

  /*
  alarms:
    • Filtra órdenes cuyo estado sea "LOADING".
    • Considera alarma cuando la última temperatura (lastTemp) supera los 18°C.
  */
  const alarms = computed(() => orders.value.filter(o => (o.lastTemp ?? 0) > 18 && o.status === 'LOADING'));

  /*
  count:
    • Cantidad total de alarmas activas.
    • Se utiliza para el badge del ícono de campana.
  */
  const count = computed(() => alarms.value.length);

  /*
  openAcceptDialog(alarm):
    • Abre el diálogo de aceptación para una alarma específica.
    • Guarda la alarma seleccionada y limpia el campo de observación.
  */
  function openAcceptDialog(alarm) {
    selectedAlarm.value = alarm;
    observation.value = '';
    errorMessage.value = null;
    acceptDialog.value = true;
  }

  /*
  closeAcceptDialog():
    • Cierra el diálogo de aceptación.
    • Limpia la alarma seleccionada y el campo de observación.
  */
  function closeAcceptDialog() {
    if (!loading.value) {
      acceptDialog.value = false;
      selectedAlarm.value = null;
      observation.value = '';
      errorMessage.value = null;
    }
  }

  /*
  confirmAccept():
    • Confirma la aceptación de la alarma.
    • Obtiene el ID del usuario autenticado.
    • Envía la petición al backend con ID de alarma, usuario y observación.
  */
  async function confirmAccept() {
    if (!selectedAlarm.value) return;

    loading.value = true;
    errorMessage.value = null;

    try {
      // Obtener ID del usuario autenticado
      const userId = getUserId();
      
      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario autenticado');
      }

      // Enviar petición al backend
      await acceptAlarm(
        selectedAlarm.value.id,
        userId,
        observation.value.trim()
      );

      // Éxito: cerrar diálogos y limpiar
      acceptDialog.value = false;
      open.value = false;
      selectedAlarm.value = null;
      observation.value = '';

      // Opcional: mostrar notificación de éxito (si tienes un sistema de notificaciones)
      console.log('Alarma aceptada exitosamente');

    } catch (error) {
      console.error('Error al aceptar alarma:', error);
      errorMessage.value = error.message || 'Error al aceptar la alarma. Intenta nuevamente.';
    } finally {
      loading.value = false;
    }
  }
</script>

<style scoped>
.accept-alarm-card {
  background: #1a1a2e;
  color: #fff;
}

.alarm-info {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 500;
}

.alarm-temp {
  color: #ff9800;
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
</style>