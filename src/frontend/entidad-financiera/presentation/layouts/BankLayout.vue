<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../login/application/useAuthStore';
import { useEntitiesStore } from '../../application/useEntitiesStore';

const router = useRouter();
const authStore = useAuthStore();
const { getEntityById } = useEntitiesStore();

// Información dinámica del banco
const bankId = computed(() => {
  const user = authStore.user.value;

  if (user?.bankId) return user.bankId;

  const email = user?.username || '';

  if (email.includes('bcp')) return 'bcp';
  if (email.includes('bbva')) return 'bbva';
  if (email.includes('interbank')) return 'interbank';
  if (email.includes('scotiabank')) return 'scotiabank';

  return 'bcp';
});

const bankEntity = computed(() => getEntityById(bankId.value));

const bankTheme = computed(() => {
  if (bankEntity.value) {
    return {
      name: bankEntity.value.name,
      color: bankEntity.value.themeColor
        ? bankEntity.value.themeColor.replace('#', '')
        : 'ff5a00',
      hex: bankEntity.value.themeColor || '#ff5a00'
    };
  }

  return {
    name: 'Banco',
    color: 'ff5a00',
    hex: '#ff5a00'
  };
});

const bankName = computed(() => bankTheme.value.name);
const bankAvatar = computed(() => `https://ui-avatars.com/api/?name=${bankId.value.toUpperCase()}&background=${bankTheme.value.color}&color=fff`);

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="bank-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="logo">Altoque <span class="badge" :style="{ backgroundColor: bankTheme.hex }">BANK</span></h2>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/banco" class="nav-item" active-class="" exact-active-class="active">
          <span class="icon">📊</span>
          <span>Inicio</span>
        </router-link>
        <router-link to="/banco/productos" class="nav-item" active-class="active">
          <span class="icon">💼</span>
          <span>Mis Productos</span>
        </router-link>
        <router-link to="/banco/promociones" class="nav-item" active-class="active">
          <span class="icon">🎁</span>
          <span>Mis Promos</span>
        </router-link>

        <router-link to="/banco/soporte" class="nav-item" active-class="active">
          <span class="icon">🎧</span>
          <span>Soporte</span>
        </router-link>

        <router-link to="/banco/ajustes" class="nav-item" active-class="active">
          <span class="icon">⚙</span>
          <span>Configuración</span>
        </router-link>
      </nav>

      <div class="sidebar-footer" @click="logout" style="cursor: pointer;">
        <div class="user-profile">
          <img :src="bankAvatar" alt="Bank" class="avatar" style="object-fit: cover;" />
          <div class="user-info">
            <span class="user-name">{{ bankName }}</span>
            <span class="user-role">Administrador</span>
          </div>
          <span class="icon-logout" style="margin-left: auto;">🚪</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="topbar">
        <h1 class="page-title">Portal de Entidad Financiera</h1>
      </header>

      <div class="content-wrapper">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.icon-logout {
  color: #8b949e;
  font-size: 1.1rem;
  transition: color 0.2s;
}

.user-profile:hover .icon-logout {
  color: #ffffff;
}

/* Reutilizamos los estilos base del Dashboard del cliente pero con un toque distintivo */
.bank-container {
  display: flex;
  height: 100vh;
  background-color: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

.sidebar {
  width: 260px;
  background-color: #161b22;
  border-right: 1px solid #30363d;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  font-size: 0.7rem;
  background-color: #ff5a00;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 800;
}

.sidebar-nav {
  flex: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: #8b949e;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #c9d1d9;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-left: 3px solid #ffffff;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #30363d;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  transition: background 0.2s;
}

.user-profile:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #e6edf3;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.user-role {
  font-size: 0.75rem;
  color: #8b949e;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
}

.content-wrapper {
  padding: 0 40px 40px 40px;
  flex: 1;
}
</style>
