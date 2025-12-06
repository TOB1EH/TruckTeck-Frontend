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

          <v-col class="d-flex flex-column">
            <div class="title">Sistema de Gestión de Carga</div>
            <div class="subtitle">Monitoreo en Tiempo Real</div>
          </v-col>

          <!-- NAVIGATION: added buttons for Monitoring, Catalog, Alarms and Conciliation -->
          <v-col cols="auto" class="d-flex align-center gap-2 nav-col">
            <v-btn
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              text
              rounded
              :class="[{ 'active': isActive(item) }, 'nav-btn']"
              aria-label="item.label"
            >
              <v-icon left small>{{ item.icon }}</v-icon>
              <span class="nav-label">{{ item.label }}</span>
            </v-btn>
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
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();
const { doLogout } = useAuth();

function onLogout() {
  doLogout();
  router.push('/login');
}

const nav = [
  { to: '/monitoring', label: 'Monitoreo', icon: 'mdi-monitor' },
  { to: '/catalog', label: 'Catálogo', icon: 'mdi-format-list-bulleted' },
  { to: '/alarms', label: 'Alarmas', icon: 'mdi-alert-circle' },
  { to: '/conciliacion', label: 'Conciliación', icon: 'mdi-scale-bathroom' }
];

function isActive(item) {
  // mark active when current route starts with the button path (works for nested routes too)
  try {
    return route.path === item.to || route.path.startsWith(item.to + '/');
  } catch (e) {
    return false;
  }
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

/* navigation styling */
.nav-col {
  gap: 8px;
  align-items: center;
}
.nav-btn {
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.85);
  text-transform: none;
  padding-left: 10px;
  padding-right: 10px;
}
.nav-btn .v-icon {
  opacity: 0.9;
}
.nav-btn.active {
  background: rgba(255,185,77,0.12) !important;
  color: #ffb94d !important;
  box-shadow: none;
}

/* small label spacing */
.nav-label {
  line-height: 1;
  font-weight: 600;
}

/* ensure layout doesn't set its own background so the global app background shows through */
.v-application {
  background: transparent !important;
}
</style>