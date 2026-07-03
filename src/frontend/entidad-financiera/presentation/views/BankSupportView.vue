<template>
  <div class="support-view">
    <div class="header-actions">
      <div>
        <h2>Soporte a Entidades</h2>
        <p class="subtitle">Canal directo con el administrador de Altoque.</p>
      </div>
    </div>

    <div class="chat-container card mt-4">
      <div v-if="!activeChatId" class="new-chat-panel">
        <h3>Abrir un ticket de soporte</h3>
        <div class="form-group mt-4">
          <label>Asunto / Tema</label>
          <input type="text" v-model="newSubject" placeholder="Ej. Error al actualizar tasas" class="input-field" />
        </div>
        <div class="form-group mt-2">
          <label>Descripción del problema</label>
          <textarea v-model="newMessage" placeholder="Detalla tu inconveniente..." rows="4" class="input-field"></textarea>
        </div>
        <button class="btn btn-primary mt-4" @click="startChat" :disabled="!newSubject || !newMessage">
          Enviar Ticket
        </button>

        <div class="history-list mt-5" v-if="myChats.length > 0">
          <h4 style="color:#8b949e; margin-bottom: 12px; font-size: 0.9rem;">Tickets Anteriores</h4>
          <div 
            v-for="chat in myChats" 
            :key="chat.id" 
            class="history-item" 
            @click="openChat(chat.id)"
          >
            <div style="flex:1;">
              <div style="font-weight: 600; color: #c9d1d9;">{{ chat.subject }}</div>
              <div style="font-size: 0.75rem; color: #8b949e; margin-top: 4px;">
                Última act: {{ new Date(chat.lastUpdate).toLocaleString() }}
              </div>
            </div>
            <div>
              <span class="status-badge" :class="chat.status === 'open' ? 'open' : 'closed'">
                {{ chat.status === 'open' ? 'En Revisión' : 'Resuelto' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="active-chat-panel">
        <div class="chat-header">
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; color: #c9d1d9;">{{ activeChat?.subject }}</h3>
            <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #8b949e;">Ticket #{{ activeChat?.id }}</p>
          </div>
          <button class="btn btn-ghost" @click="activeChatId = null">← Volver a Tickets</button>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="msg in activeChat?.messages" 
            :key="msg.id"
            class="message-bubble"
            :class="msg.senderId === userId ? 'mine' : 'theirs'"
          >
            <div class="sender">{{ msg.senderName }}</div>
            <div class="text">{{ msg.text }}</div>
            <div class="time">{{ new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</div>
          </div>
        </div>

        <div class="chat-input-area" v-if="activeChat?.status === 'open'">
          <input 
            type="text" 
            v-model="replyText" 
            placeholder="Escribe tu respuesta..." 
            @keyup.enter="sendReply"
            class="input-field" 
          />
          <button class="btn btn-primary" @click="sendReply" :disabled="!replyText.trim()">Enviar</button>
        </div>
        <div v-else class="chat-input-area text-center" style="justify-content: center; color: #8b949e;">
          Este ticket ha sido marcado como resuelto.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useAuthStore } from '../../../../login/application/useAuthStore';
import { useSupportStore } from '../../../../config/useSupportStore';

const authStore = useAuthStore();
const { getChatsByUserId, getChatById, createNewChat, sendMessage } = useSupportStore();

const userId = computed(() => authStore.user.value?.bankId || 'bank_anon');
const userName = computed(() => authStore.user.value?.bankName || 'Banco');

const myChatsWrapper = getChatsByUserId(userId.value);
const myChats = computed(() => myChatsWrapper.value);

const newSubject = ref('');
const newMessage = ref('');
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

const startChat = () => {
  if (newSubject.value && newMessage.value) {
    const id = createNewChat(userId.value, userName.value, 'admin_support', newSubject.value, newMessage.value);
    newSubject.value = '';
    newMessage.value = '';
    activeChatId.value = id;
    scrollToBottom();
  }
};

const openChat = (id) => {
  activeChatId.value = id;
  scrollToBottom();
};

const sendReply = () => {
  if (replyText.value.trim() && activeChatId.value) {
    sendMessage(activeChatId.value, userId.value, userName.value, replyText.value.trim());
    replyText.value = '';
    scrollToBottom();
  }
};
</script>

<style scoped>
.support-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
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
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.new-chat-panel {
  padding: 32px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

.new-chat-panel h3 {
  color: #c9d1d9;
  font-size: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #8b949e;
}

.input-field {
  background-color: #0d1117;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 12px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  resize: vertical;
}

.input-field:focus {
  border-color: #ff5a00;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary { background-color: #ff5a00; color: white; }
.btn-primary:hover { background-color: #e65100; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost { background: transparent; color: #8b949e; }
.btn-ghost:hover { color: #ffffff; }

.mt-2 { margin-top: 16px; }
.mt-4 { margin-top: 24px; }
.mt-5 { margin-top: 48px; }

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.history-item:hover {
  border-color: #ff5a00;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
}
.status-badge.open { background-color: rgba(255, 90, 0, 0.1); color: #ff5a00; }
.status-badge.closed { background-color: rgba(139, 148, 158, 0.1); color: #8b949e; }

/* Active Chat */
.active-chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #30363d;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255,255,255,0.02);
}

.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message-bubble.mine {
  align-self: flex-end;
  background-color: #ff5a00;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.theirs {
  align-self: flex-start;
  background-color: #21262d;
  color: #c9d1d9;
  border-bottom-left-radius: 4px;
  border: 1px solid #30363d;
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
  padding: 20px 24px;
  border-top: 1px solid #30363d;
  display: flex;
  gap: 12px;
  background-color: rgba(255,255,255,0.02);
}

.chat-input-area .input-field {
  flex: 1;
}
</style>
