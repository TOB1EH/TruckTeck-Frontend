<!-- Layout principal con appbar y navegacion -->
<template>
  <v-app>
    <v-app-bar app color="transparent" elevation="1" class="pa-0">
      <v-container fluid>
        <v-row align="center" no-gutters>
          <v-col cols="auto">
            <v-avatar size="40" class="ma-2" color="orange darken-2">
              <v-icon>mdi-truck-fast</v-icon>
            </v-avatar>
          </v-col>
          <v-col>
            <div class="title">Sistema de Gestión de Carga</div>
            <div class="subtitle">Monitoreo en Tiempo Real</div>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <v-btn outlined rounded color="white" class="logout-btn" @click="onLogout">
              <v-icon left>mdi-logout</v-icon>
              Cerrar Sesión
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container fluid class="fill-height">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';

const router = useRouter();
const { doLogout } = useAuth();

function onLogout() {
  doLogout();
  router.push('/login');
}
</script>

<style scoped>
.title {
  font-weight: 700;
  color: #fff;
}
.subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
}
.logout-btn {
  background: rgba(255,255,255,0.06);
  color: #fff;
}
/* ensure layout doesn't set its own background so the global app background shows through */
.v-application {
  background: transparent !important;
}
</style>