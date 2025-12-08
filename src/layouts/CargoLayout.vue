<!--
  Layout principal del sistema.
  Proporciona la barra superior (App Bar), navegación entre módulos
  y el contenedor donde se renderizan las vistas a través del <slot />.
-->
<template>
  <!-- Desde aquí se definen la barra superior, el área principal y el contenido interno -->
  <v-app>
    <!-- Barra superior con identidad del sistema y navegación -->
    <v-app-bar app color="transparent" elevation="1" class="pa-0">
      <v-container fluid>
        <v-row align="center" no-gutters>

          <!-- Ícono corporativo del sistema (identidad visible en AppBar) -->
          <v-col cols="auto">
            <v-avatar size="40" class="ma-2" color="orange darken-2">
              <v-icon>mdi-truck-fast</v-icon>
            </v-avatar>
          </v-col>

          <!-- Título y subtítulo del sistema -->
          <v-col class="d-flex flex-column">
            <div class="title">Sistema de Gestión de Carga</div>
            <div class="subtitle">Monitoreo en Tiempo Real</div>
          </v-col>

          <!-- Sección de navegación principal -->
          <v-col cols="auto" class="d-flex align-center gap-2 nav-col">
            <!-- Se generan los botones dinámicamente según la lista nav[] -->
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

          <!-- Botón para cerrar sesión -->
          <v-col cols="auto">
            <v-btn outlined rounded color="white" class="logout-btn" @click="onLogout">
              <v-icon left>mdi-logout</v-icon>
              Cerrar Sesión
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <!-- Contenedor principal donde se inyectan las vistas -->
    <!--
      CONTENEDOR PRINCIPAL DEL LAYOUT
      --------------------------------
      Esta sección define el área donde se renderizan dinámicamente
      las vistas del sistema (Monitoreo, Catálogo, Alarmas, etc.).

      • <v-main> constituye la zona principal de contenido del layout,
        ajustándose automáticamente al app-bar y manteniendo el comportamiento
        responsivo propio de Vuetify.
      
      • <v-container> sirve como envoltorio de ancho completo (fluid) y
        altura total (fill-height), garantizando un espacio de trabajo
        uniforme para las vistas embebidas.
      
      • <slot /> es el punto de inserción donde Vue inyecta la vista
        correspondiente a la ruta actual. De este modo, el layout permanece
        fijo (barra superior, navegación, fondo), mientras que el contenido
        cambia según la vista activa.
    -->
    <v-main>
      <v-container fluid class="fill-height">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  /*
  Script del layout principal.
  Maneja:
    - navegación activa
    - logout
    - elementos visibles en el AppBar
  */
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();
const { doLogout } = useAuth();


/*
  Cierra sesión, elimina credenciales y redirige al login.
*/
function onLogout() {
  doLogout();
  router.push('/login');
}

/*
  Ítems de navegación del AppBar.
  Cada elemento representa un módulo del sistema.
*/
const nav = [
  { to: '/monitoring', label: 'Monitoreo', icon: 'mdi-monitor' },
  { to: '/load', label: 'Carga', icon: 'mdi-truck-cargo-container' },
  { to: '/catalog', label: 'Catálogo', icon: 'mdi-format-list-bulleted' },
  { to: '/alarms', label: 'Alarmas', icon: 'mdi-alert-circle' },
  { to: '/conciliacion', label: 'Conciliación', icon: 'mdi-scale-bathroom' }
];

/*
  Determina si un botón debe mostrarse como activo.
  Funciona tanto para rutas exactas como para rutas hijas.
*/
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

/* Contenedor de botones de navegación */
.nav-col {
  gap: 8px;
  align-items: center;
}

/* Estilo base de los botones del menú */
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

/* Estilo aplicado al botón activo */
.nav-btn.active {
  background: rgba(255,185,77,0.12) !important;
  color: #ffb94d !important;
  box-shadow: none;
}

/* Ajuste a la etiqueta del menú */
.nav-label {
  line-height: 1;
  font-weight: 600;
}

/*
  Forzamos a que la aplicación no imponga un fondo.
  Esto permite usar un fondo global personalizado.
*/
.v-application {
  background: transparent !important;
}
</style>