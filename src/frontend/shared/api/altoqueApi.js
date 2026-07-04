import { API_URL } from '../../../config/constants';

export async function loginRequest(username, password) {
  const url = `${API_URL}/auth/login`;

  console.log('LOGIN URL:', url);
  console.log('LOGIN BODY:', { username, password });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
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
    headers: {
      'Content-Type': 'application/json'
    },
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
    headers: {
      'Content-Type': 'application/json'
    },
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
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
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
    headers: {
      'Content-Type': 'application/json'
    }
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
    headers: {
      'Content-Type': 'application/json'
    }
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
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reason
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo suspender la cuenta');
  }

  return data;
};