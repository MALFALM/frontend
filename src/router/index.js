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
    component: () => import('../frontend/presentation/views/SimpleSimulatorView.vue')
  },
  {
    path: '/inicio',
    component: () => import('../frontend/presentation/layouts/DashboardLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../frontend/presentation/views/SimulatorView.vue')
      },
      {
        path: 'nueva-simulacion',
        name: 'NuevaSimulacion',
        component: () => import('../frontend/presentation/views/NewSimulationView.vue')
      },
      {
        path: 'mis-simulaciones',
        name: 'MisSimulaciones',
        component: () => import('../frontend/presentation/views/SavedSimulationsView.vue')
      },
      {
        path: 'comparar',
        name: 'CompararEscenarios',
        component: () => import('../frontend/presentation/views/CompareScenariosView.vue')
      },
      {
        path: 'ajustes',
        name: 'AjustesPerfil',
        component: () => import('../frontend/presentation/views/SettingsView.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
