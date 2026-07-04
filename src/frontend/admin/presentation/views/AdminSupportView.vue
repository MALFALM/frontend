<template>
  <div class="admin-support-view">
    <div class="header-actions">
      <div>
        <h2>Soporte y Atención</h2>
        <p class="subtitle">Gestiona las consultas de clientes y bancos en tiempo real.</p>
      </div>
    </div>

    <div class="support-layout mt-4">
      <!-- Bandeja de entrada -->
      <div class="inbox-panel card">
        <div class="inbox-header">
          <h3>Bandeja de Entrada</h3>
        </div>
        <div class="chat-list">
          <div 
            v-for="chat in chats" 
            :key="chat.id"
            class="chat-item"
            :class="{ active: activeChatId === chat.id, closed: chat.status === 'closed' }"
            @click="activeChatId = chat.id"
          >
            <div class="chat-item-header">
              <span class="chat-sender font-bold">{{ getOtherParticipantName(chat) }}</span>
              <span class="status-indicator" :class="chat.status === 'open' ? 'bg-success' : 'bg-gray'"></span>
            </div>
            <div class="chat-subject">{{ chat.subject }}</div>
            <div class="chat-time">{{ new Date(chat.lastUpdate).toLocaleString() }}</div>
          </div>
          <div v-if="chats.length === 0" class="empty-inbox">
            No hay chats registrados.
          </div>
        </div>
      </div>

      <!-- Ventana de Chat Activo -->
      <div class="chat-panel card">
        <div v-if="activeChat" class="active-chat-container">
          <div class="chat-header">
            <div>
              <h3 style="margin: 0; color: #0f172a;">{{ activeChat.subject }}</h3>
              <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #64748b;">
                Usuario: {{ getOtherParticipantName(activeChat) }}
              </p>
            </div>
            <button class="btn btn-outline-danger" v-if="activeChat.status === 'open'" @click="closeCurrentChat">
              Cerrar Ticket
            </button>
            <span v-else class="badge-closed">Cerrado</span>
          </div>

          <div class="chat-messages" ref="messagesContainer">
            <div 
              v-for="msg in activeChat.messages" 
              :key="msg.id"
              class="message-bubble"
              :class="msg.senderId === 'admin_support' ? 'mine' : 'theirs'"
            >
              <div class="sender">{{ msg.senderName }}</div>
              <div class="text">{{ msg.text }}</div>
              <div class="time">{{ new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</div>
            </div>
          </div>

          <div class="chat-input-area" v-if="activeChat.status === 'open'">
            <input 
              type="text" 
              v-model="replyText" 
              placeholder="Escribe tu respuesta..." 
              @keyup.enter="sendReply"
              class="input-field" 
            />
            <button class="btn btn-primary" @click="sendReply" :disabled="!replyText.trim()">Enviar</button>
          </div>
          <div v-else class="chat-input-area text-center" style="justify-content: center; color: #64748b;">
            El ticket está cerrado.
          </div>
        </div>
        <div v-else class="empty-chat text-center">
          <div style="font-size: 3rem; margin-bottom: 16px; color: #cbd5e1;">💬</div>
          <h3>Selecciona un chat</h3>
          <p style="color: #64748b;">Elige una conversación de la bandeja de entrada para responder.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useSupportStore } from '../../../../config/useSupportStore';

const { chats, getChatById, sendMessage, closeChat } = useSupportStore();

const activeChatId = ref(null);
const activeChat = computed(() => activeChatId.value ? getChatById(activeChatId.value).value : null);
const replyText = ref('');
const messagesContainer = ref(null);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch(() => activeChat.value?.messages.length, () => {
  scrollToBottom();
});
watch(activeChatId, () => {
  scrollToBottom();
});

const getOtherParticipantName = (chat) => {
  // Simple heuristic: if the first message is from user_juan, return that name
  const firstMsg = chat.messages.find(m => m.senderId !== 'admin_support');
  return firstMsg ? firstMsg.senderName : 'Usuario';
};

const sendReply = () => {
  if (replyText.value.trim() && activeChatId.value) {
    sendMessage(activeChatId.value, 'admin_support', 'Soporte Altoque', replyText.value.trim());
    replyText.value = '';
    scrollToBottom();
  }
};

const closeCurrentChat = () => {
  if (activeChatId.value) {
    closeChat(activeChatId.value);
  }
};
</script>

<style scoped>
.admin-support-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
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

.support-layout {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.inbox-panel {
  width: 320px;
  flex-shrink: 0;
}

.inbox-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.inbox-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background 0.2s;
}

.chat-item:hover {
  background-color: #f1f5f9;
}

.chat-item.active {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.chat-item.closed {
  opacity: 0.6;
}

.chat-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.font-bold {
  font-weight: 600;
  color: #0f172a;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.bg-success { background-color: #10b981; }
.bg-gray { background-color: #94a3b8; }

.chat-subject {
  font-size: 0.85rem;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.chat-time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.empty-inbox {
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.chat-panel {
  flex: 1;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.empty-chat h3 {
  color: #334155;
  margin-bottom: 8px;
}

.active-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
}

.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #ffffff;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message-bubble.mine {
  align-self: flex-end;
  background-color: #3b82f6;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.theirs {
  align-self: flex-start;
  background-color: #f1f5f9;
  color: #0f172a;
  border-bottom-left-radius: 4px;
  border: 1px solid #e2e8f0;
}

.message-bubble .sender {
  font-size: 0.7rem;
  font-weight: 700;
  margin-bottom: 4px;
  opacity: 0.8;
}

.message-bubble .text {
  font-size: 0.95rem;
  line-height: 1.4;
}

.message-bubble .time {
  font-size: 0.65rem;
  text-align: right;
  margin-top: 6px;
  opacity: 0.7;
}

.chat-input-area {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  background-color: #f8fafc;
}

.chat-input-area .input-field {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
}

.chat-input-area .input-field:focus {
  border-color: #3b82f6;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary { background-color: #0f172a; color: white; }
.btn-primary:hover { background-color: #1e293b; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-outline-danger {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 6px 12px;
  font-size: 0.8rem;
}
.btn-outline-danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.badge-closed {
  background-color: #f1f5f9;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.mt-4 { margin-top: 24px; }
.text-center { text-align: center; }
</style>