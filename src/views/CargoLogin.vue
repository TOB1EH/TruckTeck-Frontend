<!-- Pantalla de login (estilo de la imagen, centrada sobre fondo oscuro) -->
<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="login-card" elevation="12" rounded="12">
      <v-card-text class="text-center">
        <v-avatar size="56" class="mx-auto mb-3" color="orange darken-2">
          <v-icon size="28">mdi-fuel</v-icon>
        </v-avatar>
        <h3 class="mb-2">Sistema de Gestión de Carga</h3>
        <p class="mb-6">Ingresa tus credenciales para acceder al sistema</p>

        <v-form @submit.prevent="onLogin" ref="formRef">
          <v-text-field
            v-model="username"
            label="Usuario"
            placeholder="Ingresa tu usuario"
            clearable
            variant="outlined"
            class="mb-4"
            density="comfortable"
            :rules="[v => !!v || 'Requerido']"
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
            :rules="[v => !!v || 'Requerido']"
          />

          <v-btn color="orange" block rounded @click="onLogin" :loading="loading">
            Iniciar Sesión
          </v-btn>
          <v-alert v-if="error" type="error" class="mt-4" dense>{{ error }}</v-alert>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';

const formRef = ref();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const router = useRouter();
const { doLogin } = useAuth();

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
h3 { margin: 0; color: #fff; font-weight: 700; }
p { color: rgba(255,255,255,0.65); }
</style>