import { API_URL } from '../../../config/constants';

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const saved = localStorage.getItem('altoque_auth_session');
    if (saved) {
      const session = JSON.parse(saved);
      if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
    }
  } catch (e) {
    console.error('Error reading auth token', e);
  }
  return headers;
};

export async function loginRequest(username, password) {
  const url = `${API_URL}/auth/login`;
  console.log('LOGIN URL:', url);
  console.log('LOGIN BODY:', { username, password });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const text = await response.text();
  console.log('LOGIN STATUS:', response.status);
  console.log('LOGIN RAW RESPONSE:', text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(
      `El backend no devolvió JSON. Status: ${response.status}. Respuesta: ${text.slice(0, 120)}`
    );
  }

  if (!response.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }
  return data;
}

export async function saveCreditRequest(payload) {
  const response = await fetch(`${API_URL}/creditos/guardar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al guardar la simulación');
  }
  return data;
}

export const registerRequest = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear la cuenta');
  }
  return data;
};

export const createBankRequest = async ({ username, password }) => {
  const response = await fetch(`${API_URL}/auth/banks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear la cuenta del banco');
  }
  return data;
};

export async function getUsersRequest() {
  const response = await fetch(`${API_URL}/auth/users`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los usuarios');
  }
  return data;
}

export async function getCreditsByUserRequest(userId) {
  const response = await fetch(`${API_URL}/creditos/user/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener las simulaciones del usuario');
  }
  return data;
}

export const suspendUserRequest = async (userId, reason) => {
  const response = await fetch(`${API_URL}/auth/users/${userId}/suspend`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo suspender la cuenta');
  }
  return data;
};

export const updateProfileRequest = async (userId, displayName) => {
  const response = await fetch(`${API_URL}/auth/users/${userId}/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ display_name: displayName })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo actualizar el perfil');
  }
  return data;
};

export const changePasswordRequest = async ({ id_user, currentPassword, newPassword }) => {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id_user, currentPassword, newPassword })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo actualizar la contraseña');
  }
  return data;
};

export const createSupportTicketRequest = async (payload) => {
  const response = await fetch(`${API_URL}/support/tickets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear el ticket de soporte');
  }
  return data;
};

export const getSupportTicketsByUserRequest = async (userId) => {
  const response = await fetch(`${API_URL}/support/tickets/user/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron cargar tus tickets');
  }
  return data;
};

export const getSupportTicketsRequest = async () => {
  const response = await fetch(`${API_URL}/support/tickets`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron cargar los tickets');
  }
  return data;
};

export const sendSupportMessageRequest = async (ticketId, payload) => {
  const response = await fetch(`${API_URL}/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo enviar el mensaje');
  }
  return data;
};

export const closeSupportTicketRequest = async (ticketId) => {
  const response = await fetch(`${API_URL}/support/tickets/${ticketId}/close`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cerrar el ticket');
  }
  return data;
};
