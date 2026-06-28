import { ref } from 'vue';

const profileImage = ref('https://ui-avatars.com/api/?name=Alex+Mercer&background=3b82f6&color=fff');
const userName = ref('Alex Mercer');
const userRole = ref('Admin');
const userEmail = ref('alex.mercer@gmail.com');

export function useProfile() {
  return {
    profileImage,
    userName,
    userRole,
    userEmail
  };
}
