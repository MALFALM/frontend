import { ref, watch, computed } from 'vue';

const STORAGE_KEY = 'altoque_support_chats';

const chats = ref([]);

const initializeChats = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      chats.value = JSON.parse(saved);
    } else {
      chats.value = [
        {
          id: 'chat_1',
          participants: ['user_juan', 'admin_support'],
          subject: 'Duda sobre crédito vehicular BCP',
          status: 'open',
          lastUpdate: new Date().toISOString(),
          messages: [
            { id: 'm1', senderId: 'user_juan', senderName: 'Juan Pérez', text: 'Hola, tengo una duda sobre la TCEA del BCP.', time: new Date(Date.now() - 3600000).toISOString() },
            { id: 'm2', senderId: 'admin_support', senderName: 'Soporte Altoque', text: '¡Hola Juan! Claro, ¿en qué podemos ayudarte?', time: new Date(Date.now() - 3500000).toISOString() }
          ]
        },
        {
          id: 'chat_2',
          participants: ['bank_bbva', 'admin_support'],
          subject: 'Problemas al cargar nuevo producto',
          status: 'open',
          lastUpdate: new Date().toISOString(),
          messages: [
            { id: 'm3', senderId: 'bank_bbva', senderName: 'BBVA', text: 'No puedo actualizar la tasa de mi producto.', time: new Date(Date.now() - 86400000).toISOString() }
          ]
        }
      ];
    }
  } catch (e) {
    console.error("Error loading chats from localStorage", e);
  }
};

initializeChats();

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    if (event.newValue) {
      chats.value = JSON.parse(event.newValue);
    }
  }
});

watch(chats, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });

export function useSupportStore() {
  const getChatsByUserId = (userId) => {
    return computed(() => chats.value.filter(c => c.participants.includes(userId)));
  };

  const getChatById = (chatId) => {
    return computed(() => chats.value.find(c => c.id === chatId));
  };

  const sendMessage = (chatId, senderId, senderName, text) => {
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) {
      chat.messages.push({
        id: `msg_${Date.now()}`,
        senderId,
        senderName,
        text,
        time: new Date().toISOString()
      });
      chat.lastUpdate = new Date().toISOString();
    }
  };

  const createNewChat = (senderId, senderName, receiverId, subject, initialMessage) => {
    const newChat = {
      id: `chat_${Date.now()}`,
      participants: [senderId, receiverId],
      subject,
      status: 'open',
      lastUpdate: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId,
          senderName,
          text: initialMessage,
          time: new Date().toISOString()
        }
      ]
    };
    chats.value.unshift(newChat);
    return newChat.id;
  };

  const closeChat = (chatId) => {
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) chat.status = 'closed';
  };

  return {
    chats,
    getChatsByUserId,
    getChatById,
    sendMessage,
    createNewChat,
    closeChat
  };
}