import { ref } from 'vue';
import { computed } from 'vue';
import { useAuthStore } from '../../../login/application/useAuthStore';

export function useProfile() {
  const authStore = useAuthStore();

  const userName = computed({
    get() {
      return authStore.user.value?.name || authStore.user.value?.username || 'Usuario';
    },
    set(value) {
      authStore.updateCurrentUser({ name: value });
    }
  });

  const userEmail = computed(() => {
    return authStore.user.value?.username || 'usuario@altoque.com';
  });

  const userRole = computed(() => {
    const role = authStore.user.value?.role || authStore.user.value?.rol;

    if (role === 'admin') return 'Administrador';
    if (role === 'bank') return 'Entidad Financiera';
    if (role === 'client') return 'Cliente';
    if (role === 'asesor') return 'Asesor';

    return 'Usuario';
  });

  const profileImage = computed({
    get() {
      const savedImage = authStore.user.value?.profileImage;

      if (savedImage) return savedImage;

      const name = userName.value || 'Usuario';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`;
    },
    set(value) {
      authStore.updateCurrentUser({ profileImage: value });
    }
  });

  const updateProfile = ({ name, profileImage: newProfileImage }) => {
    authStore.updateCurrentUser({
      name,
      profileImage: newProfileImage
    });
  };

  return {
    profileImage,
    userName,
    userRole,
    userEmail,
    updateProfile
  };
}