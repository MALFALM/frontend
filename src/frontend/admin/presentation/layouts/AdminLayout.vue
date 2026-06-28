<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../../login/application/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="admin-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="logo">Altoque <span class="badge">ADMIN</span></h2>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" active-class="" exact-active-class="active">
          <span class="icon">📈</span>
          <span>Dashboard Global</span>
        </router-link>
        <router-link to="/admin/entidades" class="nav-item" active-class="active">
          <span class="icon">🏢</span>
          <span>Bancos Afiliados</span>
        </router-link>
        <router-link to="/admin/usuarios" class="nav-item" active-class="active">
          <span class="icon">👥</span>
          <span>Usuarios Base</span>
        </router-link>
      </nav>

      <div class="sidebar-footer" @click="logout" style="cursor: pointer;">
        <div class="user-profile">
          <img src="https://ui-avatars.com/api/?name=Admin&background=000&color=fff" alt="Admin" class="avatar" />
          <div class="user-info">
            <span class="user-name">Super Administrador</span>
            <span class="user-role">Soporte TI</span>
          </div>
          <span class="icon-logout" style="margin-left: auto;">🚪</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="topbar">
        <h1 class="page-title">Consola de Administración Global</h1>
      </header>

      <div class="content-wrapper">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
  color: #334155;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

.sidebar {
  width: 260px;
  background-color: #0f172a;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  font-size: 0.65rem;
  background-color: #ef4444;
  color: white;
  padding: 3px 6px;
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
  padding: 12px 16px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #1e293b;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: background 0.2s;
  color: #f8fafc;
}

.user-profile:hover {
  background-color: rgba(255, 255, 255, 0.1);
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
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.user-role {
  font-size: 0.75rem;
  color: #94a3b8;
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
  padding: 32px 48px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.content-wrapper {
  padding: 0 48px 48px 48px;
  flex: 1;
}
</style>
