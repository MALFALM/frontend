<script setup>
import { useAuthStore } from '../../../../login/application/useAuthStore';
import { useEntitiesStore } from '../../application/useEntitiesStore';
import { useAdminNotificationsStore } from '../../../admin/application/useAdminNotificationsStore';
import { suspendUserRequest } from '../../../shared/api/altoqueApi';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';


const router = useRouter();
const authStore = useAuthStore();
const { getEntityById, updateEntity } = useEntitiesStore();
const { addNotification } = useAdminNotificationsStore();
const BANK_ID = computed(() => {
  const user = authStore.user.value;

  if (user?.bankId) return user.bankId;

  const email = user?.username || '';

  if (email.includes('bcp')) return 'bcp';
  if (email.includes('bbva')) return 'bbva';
  if (email.includes('interbank')) return 'interbank';
  if (email.includes('scotiabank')) return 'scotiabank';

  return 'bcp';
});

const bankEntity = computed(() => getEntityById(BANK_ID.value));

const brandColor = ref(bankEntity.value?.themeColor || '#ff5a00');
const saveMessage = ref('');

const saveSettings = () => {
  if (bankEntity.value) {
    const updatedEntity = {
      ...bankEntity.value,
      themeColor: brandColor.value
    };

    updateEntity(updatedEntity);

    saveMessage.value = 'Configuración guardada exitosamente';
    setTimeout(() => {
      saveMessage.value = '';
    }, 3000);
  }
};

const showSuspendModal = ref(false);
const isSuspending = ref(false);

const toast = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
});

const showToast = (type, title, message) => {
  toast.value = {
    show: true,
    type,
    title,
    message
  };

  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

const handleSuspendRequest = async () => {
  try {
    isSuspending.value = true;

    const user = authStore.user?.value || authStore.user;
    const userId = user?.id_user;

    if (!userId) {
      throw new Error('No se encontró el usuario logueado.');
    }

    const reason = `Suspensión solicitada por la entidad financiera ${bankEntity.value?.name || ''}`;

    const response = await suspendUserRequest(userId, reason);

    if (bankEntity.value) {
      addNotification({
        type: 'suspension_request',
        bankId: bankEntity.value.id,
        bankName: bankEntity.value.name,
        message: `El banco ${bankEntity.value.name} solicitó la suspensión temporal de su cuenta.`
      });
    }

    showSuspendModal.value = false;

    showToast(
      'success',
      'Cuenta suspendida',
      response.message || 'Tu cuenta fue suspendida temporalmente por 24 horas.'
    );

    setTimeout(() => {
      if (authStore.logout) {
        authStore.logout();
      }

      router.push('/login');
    }, 1800);
  } catch (error) {
    showToast(
      'error',
      'No se pudo suspender',
      error.message || 'Ocurrió un error al suspender la cuenta.'
    );
  } finally {
    isSuspending.value = false;
  }
};
</script>

<template>
  <div class="settings-view">
    <div class="header-actions">
      <h2>Configuración de la Entidad</h2>
      <p class="subtitle">Ajustes generales del perfil bancario.</p>
    </div>

    <div class="card mt-4 text-left">
      <h3>Branding y Marca</h3>
      <p class="subtitle mb-4">Personaliza los colores de tu portal para mantener tu identidad visual.</p>
      
      <div class="form-group">
        <label>Color Principal (Hexadecimal)</label>
        <div class="color-picker-wrapper">
          <input type="color" v-model="brandColor" class="color-input" />
          <input type="text" v-model="brandColor" class="text-input" />
        </div>
        <p class="helper-text">Este color se usará en el logo y elementos activos del menú.</p>
      </div>

      <div class="action-footer mt-4">
        <button class="btn btn-primary" @click="saveSettings">Guardar Cambios</button>
        <span class="success-message" v-if="saveMessage">{{ saveMessage }}</span>
      </div>
    </div>
    <div class="card mt-4 text-left danger-zone">
  <h3 class="text-danger">Zona de Peligro</h3>
  <p class="subtitle mb-4">Acciones críticas sobre tu cuenta institucional.</p>
  
  <div class="suspend-container">
    <div>
      <h4 style="color: #c9d1d9; margin-bottom: 4px;">Suspender Cuenta</h4>
      <p class="helper-text">Pausar temporalmente las operaciones y simulaciones con tu banco.</p>
    </div>
    <button class="btn btn-outline-danger" @click="showSuspendModal = true">
      Solicitar Suspensión
    </button>
  </div>
</div>

<!-- Modal Confirmación Suspensión -->
<div v-if="showSuspendModal" class="modal-overlay" @click.self="showSuspendModal = false">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Solicitar Suspensión de Cuenta</h3>
      <button class="close-btn" @click="showSuspendModal = false">✕</button>
    </div>

    <div class="modal-body text-left">
      <p style="color: #64748b; line-height: 1.5;">
        ¿Estás seguro de que deseas suspender la cuenta de <strong>{{ bankEntity?.name }}</strong>?
      </p>
      <p style="color: #ef4444; font-size: 0.9rem; margin-top: 12px; font-weight: 500;">
        Esto enviará una notificación a Altoque para que el Super Administrador evalúe y ejecute la pausa temporal de sus productos.
      </p>
    </div>

    <div class="modal-footer">
      <button class="btn btn-ghost" @click="showSuspendModal = false">Cancelar</button>
      <button class="btn btn-danger" @click="handleSuspendRequest">Sí, enviar solicitud</button>
    </div>
  </div>
</div>

<div v-if="toast.show" class="toast-notification" :class="toast.type">
  <div class="toast-icon">
    {{ toast.type === 'success' ? '✓' : '!' }}
  </div>

  <div>
    <strong>{{ toast.title }}</strong>
    <p>{{ toast.message }}</p>
  </div>
</div>
  </div>
</template>

<style scoped>
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  min-width: 320px;
  max-width: 420px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 14px;
  color: #ffffff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  animation: slideInToast 0.25s ease-out;
}

.toast-notification.success {
  background: #16a34a;
}

.toast-notification.error {
  background: #dc2626;
}

.toast-icon {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.toast-notification strong {
  display: block;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.toast-notification p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

@keyframes slideInToast {
  from {
    opacity: 0;
    transform: translateX(24px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.danger-zone {
  border-color: rgba(239, 68, 68, 0.3);
}

.text-danger {
  color: #ef4444 !important;
}

.suspend-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #30363d;
}

.btn-outline-danger {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-outline-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-ghost {
  background: transparent;
  color: #c9d1d9;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(13, 17, 23, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: #161b22;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  border: 1px solid #30363d;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #30363d;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #c9d1d9;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  color: #8b949e;
  font-size: 1.2rem;
  cursor: pointer;
}

.modal-body {
  padding: 24px 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #30363d;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.header-actions h2 {
  margin: 0;
  color: #ffffff;
}

.subtitle {
  color: #8b949e;
  font-size: 0.9rem;
  margin-top: 4px;
}

.card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 32px;
}

.text-left {
  text-align: left;
}

.mb-4 {
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #c9d1d9;
}

.color-picker-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  padding: 0;
}

.text-input {
  background-color: #0d1117;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 10px 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 1rem;
  width: 120px;
}

.helper-text {
  font-size: 0.75rem;
  color: #8b949e;
  margin: 0;
}

.action-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #30363d;
}

.btn {
  padding: 10px 20px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #ff5a00;
  color: white;
}

.btn-primary:hover {
  background-color: #e65100;
}

.success-message {
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 600;
}

.mt-4 {
  margin-top: 24px;
}
</style>
