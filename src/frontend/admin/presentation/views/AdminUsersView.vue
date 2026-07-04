<script setup>
import { ref, computed, onMounted } from 'vue';
import { getUsersRequest, getCreditsByUserRequest } from '../../../shared/api/altoqueApi';
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

const backendUsers = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');

const showModal = ref(false);
const selectedUser = ref(null);

const loadUsers = async () => {
  try {
    errorMessage.value = '';
    isLoading.value = true;

    const response = await getUsersRequest();

    console.log('Usuarios desde backend:', response);

    if (Array.isArray(response)) {
      backendUsers.value = response;
    } else if (Array.isArray(response.data)) {
      backendUsers.value = response.data;
    } else if (Array.isArray(response.users)) {
      backendUsers.value = response.users;
    } else {
      backendUsers.value = [];
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    errorMessage.value = error.message || 'No se pudieron cargar los usuarios.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadUsers();
});

const getNameFromEmail = (email) => {
  if (!email) return 'Cliente';

  return email
    .split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
};

const formatDate = (dateValue) => {
  if (!dateValue) return '-';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toISOString().split('T')[0];
};


const mappedBackendUsers = computed(() => {
  return backendUsers.value
    .filter(user => {
      const role = (user.rol || user.role || '').toLowerCase();
      return role === 'client' || role === 'cliente';
    })
    .map(user => ({
      id: `db_${user.id_user}`,
      id_user: user.id_user,
      name: user.display_name || user.name || user.fullName || getNameFromEmail(user.username),
      email: user.username,
      registeredAt: formatDate(user.created_at || user.createdAt),
      status: user.estado_cuenta === 0 || user.estado_cuenta === false ? 'Inactivo' : 'Activo',
      simulations: 0,
      avgTicket: 'N/A',
      bankPreferences: [],
      recentSimulations: []
    }));
});

const usersToShow = computed(() => {
  const mockEmails = mockUsers.value.map(user => user.email);

  const realUsersWithoutDuplicates = mappedBackendUsers.value.filter(user => {
    return !mockEmails.includes(user.email);
  });

  return [
    ...mockUsers.value,
    ...realUsersWithoutDuplicates
  ];
});

const getStatusClass = (status) => {
  return status === 'Activo' ? 'status-active' : 'status-inactive';
};

const openUserDetails = async (user) => {
  selectedUser.value = user;
  showModal.value = true;

  if (!user.id_user) {
    return;
  }

  try {
    const response = await getCreditsByUserRequest(user.id_user);
    const credits = Array.isArray(response) ? response : response.data || [];

    selectedUser.value = {
      ...user,
      simulations: credits.length,
      avgTicket: calculateAvgTicket(credits),
      bankPreferences: buildBankPreferences(credits),
      recentSimulations: buildRecentSimulations(credits)
    };
  } catch (error) {
    console.error('Error al cargar simulaciones del usuario:', error);
  }
};

const closeUserDetails = () => {
  showModal.value = false;
  selectedUser.value = null;
};

const exportCSV = () => {
  const headers = ['Cliente', 'Correo electrónico', 'Registro', 'Simulaciones', 'Estado'];

  const rows = usersToShow.value.map(user => [
    user.name,
    user.email,
    user.registeredAt,
    `${user.simulations} guardadas`,
    user.status
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(value => `"${value}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'usuarios_base_altoque.csv';
  link.click();

  URL.revokeObjectURL(url);
};

const getBankColor = (bankName) => {
  const name = (bankName || '').toLowerCase();

  if (name.includes('bcp')) return '#ff5a00';
  if (name.includes('interbank')) return '#00b14f';
  if (name.includes('bbva')) return '#072146';
  if (name.includes('scotiabank')) return '#ef4444';

  return '#64748b';
};

const getBankNameFromCredit = (credit) => {
  return credit.bankName || credit.banco || credit.entidad || 'Personalizado';
};

const calculateAvgTicket = (credits) => {
  if (!credits.length) return 'N/A';

  const total = credits.reduce((sum, credit) => {
    return sum + Number(credit.precio_venta || credit.vehiclePrice || 0);
  }, 0);

  const average = total / credits.length;

  return `S/ ${average.toLocaleString('en-US', {
    maximumFractionDigits: 0
  })}`;
};

const buildBankPreferences = (credits) => {
  const grouped = {};

  credits.forEach((credit) => {
    const bankName = getBankNameFromCredit(credit);

    if (!grouped[bankName]) {
      grouped[bankName] = {
        bankName,
        count: 0,
        color: getBankColor(bankName)
      };
    }

    grouped[bankName].count += 1;
  });

  return Object.values(grouped);
};

const buildRecentSimulations = (credits) => {
  return credits.slice(0, 3).map((credit) => {
    const bankName = getBankNameFromCredit(credit);

    return {
      vehicle: `${credit.marca || 'Vehículo'} ${credit.modelo || 'Simulado'}`,
      bankName,
      color: getBankColor(bankName),
      downPayment: credit.precio_venta
        ? `${Math.round((Number(credit.cuota_inicial) / Number(credit.precio_venta)) * 100)}%`
        : '0%',
      term: Number(credit.plazo_meses || 0)
    };
  });
};
</script>

<template>
  <div class="users-view">
    <div class="header-actions">
      <div>
        <h2>Usuarios Registrados</h2>
        <p class="subtitle">Visualiza a los clientes finales (Usuarios Base) que utilizan el simulador.</p>
      </div>
      <button class="btn btn-outline" @click="exportCSV">Exportar CSV</button>
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
          <tr v-for="user in usersToShow" :key="user.id">
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
    <AdminUserDetailsModal
  v-if="selectedUser"
  :show="showModal"
  :user="selectedUser"
  @close="closeUserDetails"
/>
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
