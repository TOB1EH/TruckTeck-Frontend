<!--
  Componente: Panel de Alarmas (componente simple y dialog para aceptar alarmas)
  Descripción:
    • Muestra un ícono de campana con un badge indicando la cantidad de alarmas activas.
    • Al hacer clic, despliega un diálogo que lista las alarmas detectadas.
    • Permite aceptar una alarma enviando la acción al servicio correspondiente.
    • Las alarmas se derivan de órdenes cuyo estado es LOADING y temperatura > 18°C.

  Dependencias:
    • useOrders() – Obtiene las órdenes activas en el sistema.
    • acceptAlarm() – Servicio para aceptar una alarma.
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
                <v-btn small color="green" @click="accept(a.id)">Aceptar</v-btn>
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
  </div>
</template>

<script setup>
  /*
  Script del componente
  ---------------------
  • open: controla si el diálogo está visible.
  • orders: listado de órdenes proveniente del composable useOrders().
  • alarms: alarmas filtradas según criterios de riesgo.
  • count: cantidad total de alarmas activas.
  • accept(): envía la acción de aceptación al backend.
  */
  import { ref, computed } from 'vue';
  import { acceptAlarm } from '@/services/ordersService.js';
  import { useOrders } from '@/composables/useOrders.js';

  const open = ref(false);

  /*
  useOrders():
    • Provee todas las órdenes disponibles.
    • Las alarmas se determinan evaluando temperatura y estado.
  */
  const { orders } = useOrders();

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
  accept(orderId):
    • Envía solicitud para aceptar una alarma.
    • Registra el usuario y una observación simple desde la UI.
  */
  async function accept(orderId) {
    await acceptAlarm(orderId, { user: 'operator@example.com', observation: 'Aceptada desde UI' });
  }
</script>