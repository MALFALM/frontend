<template>
  <div class="support-view">
    <div class="header-section">
      <h2 class="title">Centro de Ayuda y Soporte</h2>
      <p class="subtitle">Comunícate con nuestros asesores para resolver cualquier duda.</p>
    </div>

    <div class="chat-container card mt-4">
      <div v-if="!activeTicketId" class="new-chat-panel">
        <h3>¿En qué te podemos ayudar hoy?</h3>

        <div class="form-group mt-4">
          <label>Asunto / Tema</label>
          <input
            type="text"
            v-model="newSubject"
            placeholder="Ej. Duda sobre tasa de interés"
            class="input-field"
          />
        </div>

        <div class="form-group mt-2">
          <label>Tu mensaje</label>
          <textarea
            v-model="newMessage"
            placeholder="Escribe aquí tu consulta..."
            rows="4"
            class="input-field"
          ></textarea>
        </div>

        <button
          class="btn btn-primary mt-4"
          @click="startChat"
          :disabled="isSending || !newSubject.trim() || !newMessage.trim()"
        >
          {{ isSending ? 'Enviando...' : 'Iniciar Chat con Asesor' }}
        </button>

        <div class="history-list mt-5">
          <h4 style="color:#8b949e; margin-bottom: 12px; font-size: 0.9rem;">
            Tus consultas anteriores
          </h4>

          <div v-if="isLoading" style="color:#8b949e;">
            Cargando consultas...
          </div>

          <div v-else-if="tickets.length === 0" style="color:#8b949e;">
            Aún no tienes consultas registradas.
          </div>

          <div
            v-else
            v-for="ticket in tickets"
            :key="ticket.id_ticket"
            class="history-item"
            @click="openChat(ticket.id_ticket)"
          >
            <div style="flex:1;">
              <div style="font-weight: 600; color: #e6edf3;">
                {{ ticket.subject }}
              </div>

              <div style="font-size: 0.75rem; color: #8b949e; margin-top: 4px;">
                Última act: {{ formatDate(ticket.updated_at) }}
              </div>
            </div>

            <div>
              <span class="status-badge" :class="ticket.status === 'open' ? 'open' : 'closed'">
                {{ ticket.status === 'open' ? 'En Curso' : 'Cerrado' }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="toastMessage" class="toast-notification">
          {{ toastMessage }}
        </div>
      </div>

      <div v-else class="active-chat-panel">
        <div class="chat-header">
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; color: #e6edf3;">
              {{ activeTicket?.subject }}
            </h3>
            <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #8b949e;">
              Conversando con Soporte Altoque
            </p>
          </div>

          <button class="btn btn-ghost" @click="activeTicketId = null">
            ← Volver
          </button>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div
            v-for="msg in activeTicket?.messages || []"
            :key="msg.id_message"
            class="message-bubble"
            :class="msg.sender_role === 'client' || msg.sender_role === 'bank' ? 'mine' : 'theirs'"
          >
            <div class="sender">{{ msg.sender_name }}</div>
            <div class="text">{{ msg.message_text }}</div>
            <div class="time">
              {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </div>
          </div>
        </div>

        <div class="chat-input-area" v-if="activeTicket?.status === 'open'">
          <input
            type="text"
            v-model="replyText"
            placeholder="Escribe tu respuesta..."
            @keyup.enter="sendReply"
            class="input-field"
          />

          <button class="btn btn-primary" @click="sendReply" :disabled="!replyText.trim()">
            Enviar
          </button>
        </div>

        <div v-else class="chat-input-area text-center" style="justify-content: center; color: #8b949e;">
          Esta consulta ha sido cerrada.
        </div>

        <div v-if="toastMessage" class="toast-notification">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../../../login/application/useAuthStore';
import {
  createSupportTicketRequest,
  getSupportTicketsByUserRequest,
  sendSupportMessageRequest
} from '../../../shared/api/altoqueApi';

const authStore = useAuthStore();

const currentUser = computed(() => {
  return authStore.user.value;
});

const userId = computed(() => {
  return currentUser.value?.id_user;
});

const userName = computed(() => {
  return currentUser.value?.display_name || currentUser.value?.username || 'Cliente';
});

const newSubject = ref('');
const newMessage = ref('');
const replyText = ref('');
const tickets = ref([]);
const activeTicketId = ref(null);
const isLoading = ref(false);
const isSending = ref(false);
const toastMessage = ref('');

const activeTicket = computed(() => {
  return tickets.value.find(ticket => ticket.id_ticket === activeTicketId.value) || null;
});

const showToast = (message) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = '';
  }, 3000);
};

const loadMyTickets = async () => {
  try {
    if (!userId.value) return;

    isLoading.value = true;

    const response = await getSupportTicketsByUserRequest(userId.value);
    tickets.value = Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    console.error('Error al cargar tickets:', error);
    showToast(error.message || 'No se pudieron cargar tus consultas.');
  } finally {
    isLoading.value = false;
  }
};

const startChat = async () => {
  try {
    if (!userId.value) {
      throw new Error('Debes iniciar sesión para enviar una consulta.');
    }

    if (!newSubject.value.trim() || !newMessage.value.trim()) {
      throw new Error('Completa el asunto y el mensaje.');
    }

    isSending.value = true;

    const response = await createSupportTicketRequest({
      id_user: userId.value,
      subject: newSubject.value.trim(),
      message: newMessage.value.trim(),
      sender_role: 'client',
      sender_name: userName.value
    });

    newSubject.value = '';
    newMessage.value = '';

    await loadMyTickets();

    activeTicketId.value = response.ticketId;

    showToast('Consulta enviada correctamente.');
  } catch (error) {
    console.error('Error al crear ticket:', error);
    showToast(error.message || 'No se pudo enviar la consulta.');
  } finally {
    isSending.value = false;
  }
};

const openChat = (id) => {
  activeTicketId.value = id;
};

const sendReply = async () => {
  try {
    if (!replyText.value.trim() || !activeTicketId.value) return;

    await sendSupportMessageRequest(activeTicketId.value, {
      sender_role: 'client',
      sender_name: userName.value,
      message: replyText.value.trim()
    });

    replyText.value = '';
    await loadMyTickets();
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    showToast(error.message || 'No se pudo enviar el mensaje.');
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) return '-';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString();
};

onMounted(() => {
  loadMyTickets();
});
</script>

<style scoped>
.support-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.header-section {
  margin-bottom: 8px;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.subtitle {
  color: #8b949e;
  font-size: 1rem;
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

.btn-primary { background-color: #3b82f6; color: white; }
.btn-primary:hover { background-color: #2563eb; }
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
  border-color: #3b82f6;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
}
.status-badge.open { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
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
  background-color: #3b82f6;
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