import { ref, computed } from 'vue';
import { apiRequest } from '../../services/api';

const STORAGE_KEY = 'altoque_auth_session';

const loadSession = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.error('Error loading auth session', error);
  }
  return null;
};

const persistSession = (value) => {
  if (value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const session = ref(loadSession());

export function useAuthStore() {
  const user = computed(() => session.value?.user || session.value || null);
  const token = computed(() => session.value?.token || null);
  const isLoggedIn = computed(() => !!user.value && (!!token.value || !!session.value?.role));
  const role = computed(() => user.value?.rol || user.value?.role || session.value?.role || null);

  const setSession = (newSession) => {
    session.value = newSession;
    persistSession(newSession);
  };

  const login = async (username, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password }
    });

    setSession({ token: data.token, user: data.user });
    return data.user;
  };

  const register = async ({ username, password }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: { username, password }
    });
  };

  const bootstrapAdmin = async ({ username, password }) => {
    return apiRequest('/auth/bootstrap-admin', {
      method: 'POST',
      body: { username, password }
    });
  };

  const hasRole = (...roles) => roles.includes(role.value);

  const loginAsBank = (bankId) => {
    setSession({ user: { rol: 'bank', role: 'bank', bankId } });
  };

  const loginAsClient = (name, email) => {
    setSession({ user: { rol: 'client', role: 'client', name, email, username: email } });
  };

  const loginAsAdmin = () => {
    setSession({ user: { rol: 'admin', role: 'admin', username: 'admin' } });
  };

  const logout = () => {
    setSession(null);
  };

  return {
    user,
    token,
    role,
    isLoggedIn,
    login,
    register,
    bootstrapAdmin,
    hasRole,
    loginAsBank,
    loginAsClient,
    loginAsAdmin,
    logout
  };
}
