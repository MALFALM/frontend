<template>
  <div class="settings-container">
    <div class="header-section">
      <h2 class="title">Ajustes de Perfil</h2>
      <p class="subtitle">Administra tu cuenta, foto de perfil y seguridad.</p>
    </div>

    <div class="settings-grid mt-4">
      <!-- Tarjeta de Perfil y Foto -->
      <div class="card profile-card">
        <h3>Foto de Perfil</h3>
        <p class="text-muted">Sube una nueva foto para personalizar tu cuenta.</p>
        
        <div class="avatar-section mt-4">
          <div class="avatar-preview">
            <img :src="profileImage" alt="Perfil" v-if="profileImage" />
            <div class="avatar-placeholder" v-else>{{ avatarInitials }}</div>
          </div>
          
          <div class="avatar-actions">
            <label class="btn btn-secondary cursor-pointer">
              Subir nueva foto
              <input type="file" accept="image/*" class="hidden-input" @change="handleImageUpload" />
            </label>
            <button class="btn btn-ghost text-danger" @click="removeProfileImage" v-if="profileImage">Eliminar foto</button>
          </div>
        </div>

        <div class="divider mt-4"></div>

        <h3 class="mt-4">Información Personal</h3>
        <div class="form-group mt-2">
          <label>NOMBRE COMPLETO</label>
          <input
          id="profile-display-name"
          name="profile_display_name"
          type="text"
          v-model="displayName"
          class="input-field"
          autocomplete="off"
          placeholder="Ej. Jane Doe"
          />
        </div>
        <div class="form-group mt-2">
          <label>CORREO ELECTRÓNICO</label>
          <input
          type="email"
          :value="userEmail"
          class="input-field"
          disabled
          />
          <span class="helper-text">El correo no puede ser modificado.</span>
        </div>
        
        <button class="btn btn-primary mt-4" @click="saveProfile">Guardar cambios</button>
      </div>

      <!-- Tarjeta de Seguridad -->
      <div class="card security-card">
        <h3>Seguridad y Contraseña</h3>
        <p class="text-muted">Protege tu cuenta actualizando tu contraseña regularmente.</p>
        
        <div class="form-group mt-4">
          <label>CONTRASEÑA ACTUAL</label>
          <input type="password" v-model="passwords.current" class="input-field" placeholder="••••••••" />
        </div>
        
        <div class="form-group mt-2">
          <label>NUEVA CONTRASEÑA</label>
          <input type="password" v-model="passwords.new" class="input-field" placeholder="Mínimo 8 caracteres" />
        </div>

        <div class="form-group mt-2">
          <label>CONFIRMAR NUEVA CONTRASEÑA</label>
          <input type="password" v-model="passwords.confirm" class="input-field" placeholder="Mínimo 8 caracteres" />
        </div>
        
        <button class="btn btn-primary mt-4" @click="updatePassword" :disabled="!isPasswordValid">
          Actualizar contraseña
        </button>
      </div>
    </div>

    <!-- Toast de Notificación -->
    <div v-if="toastMessage" class="toast-notification">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useProfile } from '../../application/useProfile';
import { useAuthStore } from '../../../login/application/useAuthStore';
import { updateProfileRequest,changePasswordRequest  } from '../../../shared/api/altoqueApi';

const { profileImage } = useProfile();
const authStore = useAuthStore();

const currentUser = computed(() => {
  return authStore.user.value;
});

const displayName = ref(
  authStore.user.value?.display_name || ''
);

const userEmail = computed(() => {
  return currentUser.value?.username || '';
});

const avatarInitials = computed(() => {
  const name = displayName.value || currentUser.value?.display_name || userEmail.value || 'Usuario';

  return name
    .split('@')[0]
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
});

const passwords = ref({
  current: '',
  new: '',
  confirm: ''
});

const toastMessage = ref('');

const showToast = (msg) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = '';
  }, 3000);
};

const saveProfile = async () => {
  try {
    const userId = currentUser.value?.id_user;

    if (!userId) {
      throw new Error('No se encontró el usuario logueado.');
    }

    if (!displayName.value || displayName.value.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres.');
    }

    const response = await updateProfileRequest(userId, displayName.value.trim());

    authStore.updateCurrentUser({
      display_name: response.user.display_name
    });

    displayName.value = response.user.display_name;

    showToast('¡Perfil actualizado con éxito!');
  } catch (error) {
    showToast(error.message || 'No se pudo actualizar el perfil.');
  }
};

const removeProfileImage = () => {
  profileImage.value = null;
  showToast('Foto de perfil eliminada');
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      profileImage.value = e.target.result;
      showToast('Foto de perfil actualizada localmente');
    };

    reader.readAsDataURL(file);
  }
};

const isPasswordValid = computed(() => {
  return passwords.value.current.length > 0 &&
         passwords.value.new.length >= 8 &&
         passwords.value.new === passwords.value.confirm;
});

const updatePassword = async () => {
  try {
    const userId = currentUser.value?.id_user;

    if (!userId) {
      throw new Error('No se encontró el usuario logueado.');
    }

    if (!isPasswordValid.value) {
      throw new Error('Verifica que las contraseñas coincidan y tengan mínimo 8 caracteres.');
    }

    await changePasswordRequest({
      id_user: userId,
      currentPassword: passwords.value.current,
      newPassword: passwords.value.new
    });

    showToast('¡Contraseña actualizada correctamente!');
    passwords.value = { current: '', new: '', confirm: '' };
  } catch (error) {
    showToast(error.message || 'No se pudo actualizar la contraseña.');
  }
};
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-section { margin-bottom: 8px; }
.title { font-size: 1.8rem; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
.subtitle { color: #8b949e; font-size: 1rem; }

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .settings-grid { grid-template-columns: 1fr; }
}

.card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 32px;
  display: flex;
  flex-direction: column;
}

.card h3 { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 4px; }
.text-muted { color: #8b949e; font-size: 0.9rem; }
.text-danger { color: #f85149; }

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #21262d;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #30363d;
}

.avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { font-size: 2rem; font-weight: 700; color: #8b949e; }

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hidden-input { display: none; }
.cursor-pointer { cursor: pointer; }

.form-group { display: flex; flex-direction: column; gap: 8px; }
label { font-size: 0.75rem; font-weight: 700; color: #8b949e; letter-spacing: 0.05em; }
.helper-text { font-size: 0.75rem; color: #8b949e; }

.input-field {
  width: 100%;
  background-color: #0d1117;
  border: 1px solid #30363d;
  color: #e6edf3;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}
.input-field:focus { border-color: #3b82f6; }
.input-field:disabled { background-color: #21262d; color: #8b949e; cursor: not-allowed; }

.divider { height: 1px; background-color: #30363d; width: 100%; }

.btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; text-align: center; }
.btn-primary { background-color: #3b82f6; color: white; }
.btn-primary:hover:not(:disabled) { background-color: #2563eb; }
.btn-primary:disabled { background-color: #21262d; color: #8b949e; cursor: not-allowed; }
.btn-secondary { background-color: #21262d; color: #c9d1d9; border: 1px solid #30363d; }
.btn-secondary:hover { background-color: #30363d; color: #ffffff; }
.btn-ghost { background: transparent; font-size: 0.85rem;}
.btn-ghost:hover { text-decoration: underline; }

.mt-2 { margin-top: 12px; }
.mt-4 { margin-top: 24px; }

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: #10b981;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  animation: slideUp 0.3s ease forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
