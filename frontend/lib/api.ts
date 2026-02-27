import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  username: string;
  is_admin: boolean;
}

export interface SignUpData {
  username: string;
  password: string;
  is_admin?: boolean;
}

export interface SignInData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Appointment {
  id: number;
  startime: string;
  endtime: string;
  purpose: string;
  username: string;
}

export interface AppointmentCreate {
  startime: string;
  endtime: string;
  purpose: string;
}

export const authApi = {
  signUp: async (data: SignUpData) => {
    const response = await api.post<User>('/signup/', data);
    return response.data;
  },

  signIn: async (data: SignInData) => {
    const response = await api.post<AuthResponse>('/signin/', data);
    return response.data;
  },
};

export const appointmentApi = {
  getAll: async () => {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
  },

  create: async (data: AppointmentCreate) => {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  update: async (id: number, data: AppointmentCreate) => {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },
};

export default api;
