import { ref, watch } from 'vue';

const STORAGE_KEY = 'altoque_admin_notifications';

const notifications = ref([]);

const initializeNotifications = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      notifications.value = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error loading notifications from localStorage", e);
  }
};

initializeNotifications();

watch(notifications, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });

export function useAdminNotificationsStore() {
  const addNotification = (notification) => {
    notifications.value.push({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      read: false,
      ...notification
    });
  };

  const markAsRead = (id) => {
    const notif = notifications.value.find(n => n.id === id);
    if (notif) notif.read = true;
  };

  const getUnreadCount = () => {
    return notifications.value.filter(n => !n.read).length;
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    getUnreadCount
  };
}
