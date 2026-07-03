<script setup>
import { useProfile } from '../../application/useProfile';
import { useAuthStore } from '../../../../login/application/useAuthStore';
import { useRouter } from 'vue-router';

const { profileImage, userName, userRole } = useProfile();
const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <svg class="logo-icon" viewBox="0 0 40 40" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4L4 36H12L20 20L28 36H36L20 4Z" fill="#3b82f6"/>
          <path d="M9 25L35 15L32 10L6 20L9 25Z" fill="#00b4d8"/>
        </svg>
        <div class="brand-text">
          <span class="brand-name">Altoque</span>
          <span class="brand-sub">PREMIUM FINTECH</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/inicio" class="nav-item" active-class="" exact-active-class="active">
          <span class="icon">⊞</span>
          <span>Simulador Activo</span>
        </router-link>
        <router-link to="/inicio/nueva-simulacion" class="nav-item" active-class="active">
          <span class="icon">⊕</span>
          <span>Nueva Simulación</span>
        </router-link>
        <router-link to="/inicio/mis-simulaciones" class="nav-item" active-class="active">
          <span class="icon">↺</span>
          <span>Mis Simulaciones</span>
        </router-link>
        <router-link to="/inicio/comparar" class="nav-item" active-class="active">
          <span class="icon">⇄</span>
          <span>Comparar Escenarios</span>
        </router-link>
        <router-link to="/inicio/soporte" class="nav-item" active-class="active">
          <span class="icon">🎧</span>
          <span>Centro de Ayuda</span>
        </router-link>
        <router-link to="/inicio/ajustes" class="nav-item" active-class="active">
          <span class="icon">⚙</span>
          <span>Ajustes de Perfil</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile">
          <router-link to="/inicio/ajustes" style="text-decoration: none; display: flex; align-items: center; gap: 12px; flex: 1;">
            <img v-if="profileImage" :src="profileImage" alt="User" class="avatar" style="object-fit: cover;" />
            <div v-else class="avatar" style="display: flex; align-items: center; justify-content: center; background-color: #3b82f6; color: white; font-weight: bold; font-size: 0.9rem;">
              AM
            </div>
            <div class="user-info">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">{{ userRole }}</span>
            </div>
          </router-link>
          
          <button class="logout-btn" title="Cerrar sesión" @click="handleLogout">
            🚪
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="topbar">
        <h1 class="page-title">Dashboard Simulador</h1>
        <div class="topbar-actions">
          <router-link to="/inicio/nueva-simulacion" class="btn btn-primary" style="text-decoration: none;">+ Nueva simulación</router-link>
        </div>
      </header>

      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #0d1117; /* Dark background */
  color: #e6edf3;
  font-family: 'Inter', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background-color: #161b22;
  border-right: 1px solid #30363d;
  display: flex;
  flex-direction: column;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-bottom: 1px solid #30363d;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.brand-sub {
  font-size: 0.65rem;
  font-weight: 600;
  color: #8b949e;
  letter-spacing: 0.05em;
}

.sidebar-nav {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: #8b949e;
  text-decoration: none;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #c9d1d9;
}

.nav-item.active {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.icon {
  font-size: 1.1rem;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #30363d;
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  transition: background 0.2s;
}

.user-profile:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.logout-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
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
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e6edf3;
}

.user-role {
  font-size: 0.75rem;
  color: #8b949e;
}

/* Main Content */
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

.topbar-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-dark {
  background-color: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
}

.btn-dark:hover {
  background-color: #30363d;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.content-wrapper {
  padding: 0 40px 40px 40px;
  flex: 1;
}
</style>
