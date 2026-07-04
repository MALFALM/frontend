<script setup>
import { ref, onMounted } from 'vue';
import AdminUserDetailsModal from './AdminUserDetailsModal.vue';
import { apiRequest } from '../../../../services/api';

const mockUsers = ref([]);
const showModal = ref(false);
const selectedUser = ref(null);
const loadError = ref('');

const fallbackUsers = [
  { id: 'usr_001', name: 'Alex Mercer', email: 'alex@ejemplo.com', registeredAt: '2026-06-25', status: 'Activo', simulations: 5, avgTicket: 'S/ 65,000', bankPreferences: [], recentSimulations: [] }
];

const getStatusClass = (status) => status === 'Activo' ? 'status-active' : 'status-inactive';

const openUserDetails = (user) => {
  selectedUser.value = user;
  showModal.value = true;
};

const mapUser = (user) => ({
  id: user.id_user,
  name: user.username,
  email: user.username,
  registeredAt: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
  status: user.estado_cuenta ? 'Activo' : 'Inactivo',
  simulations: 0,
  avgTicket: 'N/A',
  role: user.rol,
  bankPreferences: user.bankName ? [{ bankName: user.bankName, count: 0, color: '#0f172a' }] : [],
  recentSimulations: []
});

const loadUsers = async () => {
  try {
    const response = await apiRequest('/auth/users');
    mockUsers.value = (response.data || []).map(mapUser);
  } catch (error) {
    loadError.value = error.message;
    mockUsers.value = fallbackUsers;
  }
};

onMounted(loadUsers);
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

    <p v-if="loadError" class="subtitle">No se pudo cargar desde API: {{ loadError }}. Mostrando respaldo local.</p>

    <div class="table-card mt-4">
      <table class="entities-table">
        <thead>
          <tr>
            <th>CLIENTE</th>
            <th>CORREO ELECTRÃ“NICO</th>
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
