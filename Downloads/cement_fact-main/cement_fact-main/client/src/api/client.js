import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // In production, use relative path for same-domain API
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  return 'http://localhost:4000/api';
};

const api = axios.create({
  baseURL: getBaseURL()
});

export function attachToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// Add API calls for user management
export const fetchUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

export const deleteUser = async (id) => {
  await api.delete(`/auth/users/${id}`);
};

export default api;
