<script setup>
import { ref, computed } from 'vue';
import { useEntitiesStore } from '../../../entidad-financiera/application/useEntitiesStore';
import { useAdminNotificationsStore } from '../../application/useAdminNotificationsStore';

const { entities, addEntity, toggleSuspendEntity } = useEntitiesStore();
const { notifications } = useAdminNotificationsStore();

const suspendingBankIds = computed(() => {
  return notifications.value
    .filter(n => n.type === 'suspension_request')
    .map(n => n.bankId);
});

const showModal = ref(false);
const showCredentialsModal = ref(false);
const generatedCredentials = ref(null);
const newEntity = ref({
  name: '',
  id: '',
  themeColor: '#000000'
});

const generateIdFromName = () => {
  if (newEntity.value.name && !newEntity.value.id) {
    newEntity.value.id = newEntity.value.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
};

const handleSave = () => {
  if (newEntity.value.name && newEntity.value.id) {
    addEntity({
      id: newEntity.value.id,
      name: newEntity.value.name,
      themeColor: newEntity.value.themeColor,
      products: []
    });
    
    // Generar credenciales mock
    const email = `admin@${newEntity.value.id}.com`;
    const password = Math.random().toString(36).slice(-8);
    generatedCredentials.value = { email, password, name: newEntity.value.name };
    
    showModal.value = false;
    showCredentialsModal.value = true;
    
    newEntity.value = { name: '', id: '', themeColor: '#000000' };
  }
};

const closeCredentialsModal = () => {
  showCredentialsModal.value = false;
  generatedCredentials.value = null;
};
</script>

<template>
  <div class="entities-view">
    <div class="header-actions">
      <div>
        <h2>Bancos Afiliados</h2>
        <p class="subtitle">Gestiona las entidades financieras que operan en Altoque.</p>
      </div>
      <button class="btn btn-primary" @click="showModal = true">+ Registrar nuevo Banco</button>
    </div>

    <div class="table-card mt-4">
      <table class="entities-table">
        <thead>
          <tr>
            <th>BANCO</th>
            <th>ID INTERNO</th>
            <th>COLOR DE MARCA</th>
            <th>PRODUCTOS</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entity in entities" :key="entity.id" :class="{ 'suspension-row': suspendingBankIds.includes(entity.id) }">
            <td class="font-bold">
              <div class="bank-name-col">
                <div class="color-dot" :style="{ backgroundColor: entity.themeColor || '#ccc' }"></div>
                {{ entity.name }}
                <span v-if="suspendingBankIds.includes(entity.id)" title="Solicitud de suspensión pendiente">⚠️</span>
              </div>
            </td>
            <td class="text-gray">{{ entity.id }}</td>
            <td>
              <span class="hex-badge">{{ entity.themeColor || '#N/A' }}</span>
            </td>
            <td>{{ entity.products ? entity.products.length : 0 }} activos</td>
            <td>
              <span class="status-badge" :class="entity.isSuspended ? 'danger' : (suspendingBankIds.includes(entity.id) ? 'warning' : 'active')">
                {{ entity.isSuspended ? 'Suspendido' : (suspendingBankIds.includes(entity.id) ? 'En revisión' : 'Activo') }}
              </span>
            </td>
            <td>
              <button class="btn btn-outline-small" @click="toggleSuspendEntity(entity.id)">
                {{ entity.isSuspended ? 'Reactivar' : 'Suspender' }}
              </button>
            </td>
          </tr>
          <tr v-if="entities.length === 0">
            <td colspan="6" class="text-center py-4 text-gray">No hay bancos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nuevo Banco -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Registrar Nueva Entidad</h3>
          <button class="close-btn" @click="showModal = false">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre de la Entidad</label>
            <input type="text" v-model="newEntity.name" @blur="generateIdFromName" placeholder="Ej. Scotiabank" class="input-field" />
          </div>
          
          <div class="form-group">
            <label>ID Interno (URL amigable)</label>
            <input type="text" v-model="newEntity.id" placeholder="ej. scotiabank" class="input-field" />
            <p class="helper-text">Este ID se usa internamente y debe ser único (sin espacios).</p>
          </div>
          
          <div class="form-group">
            <label>Color Principal (Hexadecimal)</label>
            <div class="color-picker-wrapper">
              <input type="color" v-model="newEntity.themeColor" class="color-input" />
              <input type="text" v-model="newEntity.themeColor" class="input-field text-input" />
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="handleSave" :disabled="!newEntity.name || !newEntity.id">Guardar Entidad</button>
        </div>
      </div>
    </div>
    
    <!-- Modal Credenciales Generadas (Mock) -->
    <div v-if="showCredentialsModal" class="modal-overlay" @click.self="closeCredentialsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>¡Banco Creado Exitosamente!</h3>
          <button class="close-btn" @click="closeCredentialsModal">✕</button>
        </div>
        
        <div class="modal-body text-center">
          <div style="font-size: 3rem; margin-bottom: 16px;">✉️</div>
          <p style="color: #64748b; margin-bottom: 16px;">
            El banco <strong>{{ generatedCredentials.name }}</strong> ha sido registrado. 
            Como esto es un entorno de simulación, estas son las credenciales generadas para ingresar:
          </p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px dashed #cbd5e1; text-align: left;">
            <p><strong>Correo corporativo:</strong> {{ generatedCredentials.email }}</p>
            <p><strong>Contraseña:</strong> {{ generatedCredentials.password }}</p>
          </div>
          <p style="color: #ef4444; font-size: 0.85rem; margin-top: 16px;">
            En producción, estas credenciales serían enviadas por correo electrónico al representante del banco, ya que el sistema no admite el registro directo de entidades.
          </p>
        </div>
        
        <div class="modal-footer" style="justify-content: center;">
          <button class="btn btn-primary" @click="closeCredentialsModal">Entendido</button>
        </div>
      </div>
    </div>
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

.btn-primary {
  background-color: #0f172a;
  color: white;
}

.btn-primary:hover {
  background-color: #1e293b;
}

.btn-primary:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: #64748b;
}

.btn-ghost:hover {
  background: #f1f5f9;
}

.btn-outline-small {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #ef4444;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-outline-small:hover {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
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

.bank-name-col {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.font-bold { font-weight: 600; color: #0f172a; }
.text-gray { color: #64748b; }
.text-center { text-align: center; }
.py-4 { padding: 24px 0; }

.hex-badge {
  background-color: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}

.status-badge.active {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.suspension-row {
  background-color: rgba(239, 68, 68, 0.05) !important;
}

.suspension-row td {
  border-color: rgba(239, 68, 68, 0.2);
}

.mt-4 { margin-top: 24px; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.input-field {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  color: #0f172a;
}

.input-field:focus {
  border-color: #3b82f6;
}

.helper-text {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.color-picker-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  background: none;
}

.text-input {
  width: 120px;
  font-family: monospace;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
