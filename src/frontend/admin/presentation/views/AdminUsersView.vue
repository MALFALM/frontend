<script setup>
import { ref } from 'vue';
import AdminUserDetailsModal from './AdminUserDetailsModal.vue';

// Mock de usuarios registrados con historial extendido
const mockUsers = ref([
  { 
    id: 'usr_001', name: 'Alex Mercer', email: 'alex@ejemplo.com', registeredAt: '2026-06-25', status: 'Activo', simulations: 5, avgTicket: 'S/ 65,000',
    bankPreferences: [
      { bankName: 'BCP', count: 3, color: '#ff5a00' },
      { bankName: 'Interbank', count: 2, color: '#00b14f' }
    ],
    recentSimulations: [
      { vehicle: 'Toyota RAV4 2024', bankName: 'BCP', color: '#ff5a00', downPayment: '20%', term: 36 },
      { vehicle: 'Kia Sportage', bankName: 'Interbank', color: '#00b14f', downPayment: '25%', term: 48 }
    ]
  },
  { 
    id: 'usr_002', name: 'María Gómez', email: 'maria.g@gmail.com', registeredAt: '2026-06-26', status: 'Activo', simulations: 2, avgTicket: 'S/ 42,000',
    bankPreferences: [
      { bankName: 'BBVA', count: 2, color: '#072146' }
    ],
    recentSimulations: [
      { vehicle: 'Nissan Versa', bankName: 'BBVA', color: '#072146', downPayment: '10%', term: 60 }
    ]
  },
  { 
    id: 'usr_003', name: 'Carlos Ruíz', email: 'cruiz@hotmail.com', registeredAt: '2026-06-27', status: 'Inactivo', simulations: 0, avgTicket: 'N/A',
    bankPreferences: [],
    recentSimulations: []
  },
  { 
    id: 'usr_004', name: 'Laura Vargas', email: 'laura.vargas@empresa.pe', registeredAt: '2026-06-28', status: 'Activo', simulations: 12, avgTicket: 'S/ 115,000',
    bankPreferences: [
      { bankName: 'BCP', count: 8, color: '#ff5a00' },
      { bankName: 'BBVA', count: 4, color: '#072146' }
    ],
    recentSimulations: [
      { vehicle: 'Jeep Grand Cherokee', bankName: 'BCP', color: '#ff5a00', downPayment: '30%', term: 24 },
      { vehicle: 'Ford Explorer', bankName: 'BBVA', color: '#072146', downPayment: '15%', term: 36 },
      { vehicle: 'Honda CR-V', bankName: 'BCP', color: '#ff5a00', downPayment: '20%', term: 48 }
    ]
  }
]);

const getStatusClass = (status) => {
  return status === 'Activo' ? 'status-active' : 'status-inactive';
};

const showModal = ref(false);
const selectedUser = ref(null);

const openUserDetails = (user) => {
  selectedUser.value = user;
  showModal.value = true;
};
</script>

<template>
  <div class="users-view">
    <div class="header-actions">
      <div>
        <h2>Usuarios Registrados</h2>
        <p class="subtitle">Visualiza a los clientes finales (Usuarios Base) que utilizan el simulador.</p>
      </div>
      <button class="btn btn-outline">Exportar CSV</button>
    </div>

    <div class="table-card mt-4">
      <table class="entities-table">
        <thead>
          <tr>
            <th>CLIENTE</th>
            <th>CORREO ELECTRÓNICO</th>
            <th>REGISTRO</th>
            <th>SIMULACIONES</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in mockUsers" :key="user.id">
            <td class="font-bold">
              <div class="user-name-col">
                <img :src="`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=f1f5f9&color=64748b`" class="user-avatar" />
                {{ user.name }}
              </div>
            </td>
            <td class="text-gray">{{ user.email }}</td>
            <td class="text-gray">{{ user.registeredAt }}</td>
            <td class="font-semibold">{{ user.simulations }} guardadas</td>
            <td>
              <span class="status-badge" :class="getStatusClass(user.status)">{{ user.status }}</span>
            </td>
            <td>
              <button class="btn btn-outline-small" @click="openUserDetails(user)">Ver detalle</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- User Details Modal -->
    <AdminUserDetailsModal :show="showModal" :user="selectedUser" @close="showModal = false" />
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions h2 {
  margin: 0;
  color: #0f172a;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 4px;
}

.btn {
  padding: 10px 20px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-outline {
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.btn-outline:hover {
  background-color: #f1f5f9;
}

.btn-outline-small {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-outline-small:hover {
  background-color: #f8fafc;
  color: #0f172a;
}

.table-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.entities-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.entities-table th {
  background-color: #f8fafc;
  padding: 16px 24px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.entities-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.95rem;
}

.user-name-col {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.font-bold { font-weight: 600; color: #0f172a; }
.font-semibold { font-weight: 600; }
.text-gray { color: #64748b; }

.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}

.status-active {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-inactive {
  background-color: #f1f5f9;
  color: #94a3b8;
}

.mt-4 { margin-top: 24px; }
</style>
