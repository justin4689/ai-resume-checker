import { api } from './client';
import type { User } from '@/types';

export const authApi = {
  register: (payload: { name?: string; email?: string; password?: string }) =>
    api.post<{ user: User }>('/auth/register', payload),

  login: (payload: { email?: string; password?: string }) =>
    api.post<{ user: User }>('/auth/login', payload),

  logout: () => api.post<{ ok: boolean }>('/auth/logout'),

  me: () => api.get<{ user: User }>('/auth/me'),

  updateProfile: (payload: { name?: string; email?: string }) =>
    api.patch<{ user: User }>('/auth/profile', payload),

  changePassword: (payload: { currentPassword?: string; newPassword?: string }) =>
    api.patch<{ ok: boolean }>('/auth/password', payload),
};
