import { ref, computed } from 'vue';
import { login as authLogin } from '@/services/authService.js';

const STORAGE_KEY = 'truckteck_user';
const user = ref(null);

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) user.value = JSON.parse(raw);
  } catch (e) {
    user.value = null;
  }
}

function saveToStorage() {
  if (user.value) localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value));
  else localStorage.removeItem(STORAGE_KEY);
}

loadFromStorage();

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value);

  async function doLogin(username, password) {
    const u = await authLogin(username, password);
    user.value = { username: u.username };
    saveToStorage();
    return user.value;
  }

  function doLogout() {
    user.value = null;
    saveToStorage();
  }

  return {
    user,
    isAuthenticated,
    doLogin,
    doLogout
  };
}
