// Mock auth service used by the demo app.
// Replace with real API calls when integrating with a backend.

export async function login(username, password) {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 250));

  if (!username || !password) {
    throw new Error('Usuario o contraseña inválidos');
  }

  return { username };
}

export function logout() {
  return Promise.resolve({ ok: true });
}

export function isAuthenticated() {
  // Basic client-side check used by the demo router guard.
  try {
    return !!localStorage.getItem('user');
  } catch (e) {
    return false;
  }
}
