import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../landingPage/presentation/views/LandingPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: LandingPage
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../login/presentation/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../login/presentation/views/RegisterView.vue')
  },
  {
    path: '/simulator',
    name: 'SimpleSimulator',
    component: () => import('../frontend/cliente/presentation/views/SimpleSimulatorView.vue')
  },
  {
    path: '/inicio',
    component: () => import('../frontend/cliente/presentation/layouts/DashboardLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../frontend/cliente/presentation/views/SimulatorView.vue')
      },
      {
        path: 'nueva-simulacion',
        name: 'NuevaSimulacion',
        component: () => import('../frontend/cliente/presentation/views/NewSimulationView.vue')
      },
      {
        path: 'mis-simulaciones',
        name: 'MisSimulaciones',
        component: () => import('../frontend/cliente/presentation/views/SavedSimulationsView.vue')
      },
      {
        path: 'comparar',
        name: 'CompararEscenarios',
        component: () => import('../frontend/cliente/presentation/views/CompareScenariosView.vue')
      },
      {
        path: 'ajustes',
        name: 'AjustesPerfil',
        component: () => import('../frontend/cliente/presentation/views/SettingsView.vue')
      }
    ]
  },
  {
    path: '/banco',
    component: () => import('../frontend/entidad-financiera/presentation/layouts/BankLayout.vue'),
    children: [
      {
        path: '',
        name: 'BankDashboard',
        component: () => import('../frontend/entidad-financiera/presentation/views/BankDashboardView.vue')
      },
      {
        path: 'productos',
        name: 'BankProducts',
        component: () => import('../frontend/entidad-financiera/presentation/views/BankProductsView.vue')
      },
      {
        path: 'promociones',
        name: 'BankPromotions',
        component: () => import('../frontend/entidad-financiera/presentation/views/BankPromotionsView.vue')
      },
      {
        path: 'ajustes',
        name: 'BankSettings',
        component: () => import('../frontend/entidad-financiera/presentation/views/BankSettingsView.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('../frontend/admin/presentation/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../frontend/admin/presentation/views/AdminDashboardView.vue')
      },
      {
        path: 'entidades',
        name: 'AdminEntities',
        component: () => import('../frontend/admin/presentation/views/AdminEntitiesView.vue')
      },
      {
        path: 'usuarios',
        name: 'AdminUsers',
        component: () => import('../frontend/admin/presentation/views/AdminUsersView.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
