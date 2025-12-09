<!-- Pantalla de login (estilo de la imagen, centrada sobre fondo oscuro) -->
<template>
  <!-- Crear un contenedor centrado vertical y horizontalmente donde se renderiza la tarjeta de login -->
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="login-card" elevation="12" rounded="12">
      <v-card-text class="text-center">
        <!-- Sirve como elemento de identidad visual. Usa un degradado radial y sombra interna para simular volumen y reflejo -->
        <v-avatar size="56" class="brand-avatar mx-auto mb-3">
          <v-icon size="28">mdi-fuel</v-icon>
        </v-avatar>

        <!-- Titulo y subtitulo -->
        <h3 class="mb-2">Sistema de Gestión de Carga</h3>
        <p class="mb-6">Ingresa tus credenciales para acceder al sistema</p>

        <!-- Formulario de login con validación -->
        <v-form @submit.prevent="onLogin" ref="formRef">
          <!-- Campos de usuario y contraseña con validación -->
          <v-text-field
            v-model="username"
            label="Usuario"
            placeholder="Ingresa tu usuario"
            clearable
            variant="outlined"
            class="mb-4"
            density="comfortable"
            :rules="usernameRules"
          />
          <v-text-field
            v-model="password"
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            clearable
            type="password"
            variant="outlined"
            class="mb-6"
            density="comfortable"
            :rules="passwordRules"
          />

          <!-- Botón con gradiente lineal, sombra y overlay sutil para mezclar con el tinte del fondo -->
          <v-btn class="login-btn" block rounded @click="onLogin" :loading="loading">
            Iniciar Sesión
          </v-btn>
          <!-- Crear mensaje de error si hay un error de autenticación -->
          <v-alert v-if="error" type="error" class="mt-4" dense>{{ error }}</v-alert>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
/* Importacion de composables y librerias necesarias */
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';

const formRef = ref();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
/* Reglas para validación de usuario */
const usernameRules = [
  v => !!v || 'Requerido',
  v => (v && v.length >= 4) || 'El usuario debe tener al menos 4 caracteres'
];

/* Reglas para validacion de contraseña */
const passwordRules = [
  v => !!v || 'Requerido',
  v => v.length >= 4 || 'La contraseña debe tener al menos 4 caracteres',
];


const router = useRouter();
const { doLogin } = useAuth();

/* Se crea la funcion al interactuar con el boton de iniciar sesión */
async function onLogin() {
  error.value = '';
  loading.value = true;

  try {
    await doLogin(username.value, password.value);
    router.replace('/monitoring');
  } catch (e) {
    if (e instanceof Error) error.value = e.message;
    else error.value = 'Error de autenticación';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
    .login-card {
      width: 520px;
      padding: 28px;
      background: rgba(10, 18, 30, 0.68);
      color: #fff;
      border-radius: 12px;
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,0.04);
    }
    h3 { 
        margin: 0;
        color: #fff; 
        font-weight: 700;
    }
    p {
        color: rgba(255,255,255,0.65);
    }
    
    /* ---------- Avatar estilizado (gradiente radial + brillo) ---------- */
    .brand-avatar {
      /* display: flex;
      align-items: center;
      justify-content: center; */
      color: #fff;
      /* fondo principal con degradado radial para dar ese "naranja mezclado" */
      background-image: radial-gradient(circle at 30% 30%,
        rgba(255,255,255,0.92) 0%,
        rgba(255,185,77,1) 22%,
        rgba(255,138,0,1) 55%,
        #d94a00 100%);
      /* volumen */
      box-shadow: 0 8px 24px rgba(217,74,0,0.18), inset 0 -6px 14px rgba(0,0,0,0.15);
      border-radius: 50%;
    }
    /* Asegurar icono blanco y leve sombra para mejor lectura */
    .brand-avatar .v-icon { color: #fff; filter: drop-shadow(0 1px 0 rgba(0,0,0,0.25)); }
    
    /* ---------- Botón de iniciar sesión con gradiente ---------- */
    .login-btn {
      position: relative;
      overflow: hidden;
      color: #fff !important;
      background-color: #ff8a00; /* fallback */
      background-image: linear-gradient(90deg, #ffb94d 0%, #ff8a00 50%, #d94a00 100%) !important;
      border-radius: 8px;
      box-shadow: 0 6px 18px rgba(217,74,0,0.18);
      text-transform: none;
      font-weight: 600;
      transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Overlay sutil para "mezclar" con el tinte azul del fondo como en la imagen */
    /* ::after crea una capa adicional dentro del botón. Se inserta justo después del contenido real del elemento, 
    y permite agregar capas, decoraciones, overlays, íconos, sombras, etc. */
    .login-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 8px;
      /* un pequeño tintado azul en parte izquierda que se mezcla con el naranja */
      background: linear-gradient(90deg, rgba(6,30,70,0.06), rgba(6,26,60,0.10));
      pointer-events: none;
    }
    
    /* Efecto cuando pasa el mouse sobre el boton de inicio de sesion */
    .login-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 34px rgba(217,74,0,0.24);
    }

    /* :active se activa cuando el usuario presiona el elemento. Representa el “estado de clic” */
    .login-btn:active {
      transform: translateY(0);
      box-shadow: 0 6px 18px rgba(0,0,0,0.22);
      opacity: 0.98;
    }
    
    /* Si Vuetify aplica clases que sobreescriben estilos, esta regla ayuda (usar con moderación) */
    .login-btn.v-btn {
      background-image: linear-gradient(90deg, #ffb94d 0%, #ff8a00 50%, #d94a00 100%) !important;
    }
    
    /* Mantener contraste y legibilidad en mensajes de error/alerta */
    .v-alert { color: #fff; }
    
    /* Ajustes responsivos */
    @media (max-width: 560px) {
      .login-card { width: 92%; padding: 20px; }
    }
</style>