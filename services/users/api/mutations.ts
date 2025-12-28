// services/users/api/mutations.ts

import { User, UserPayload } from '@/types/user';
import axios from 'axios';

export async function createUserApi(payload: UserPayload): Promise<User> {
  const res = await axios.post('/api/users', payload);
  return res.data;
}
export async function updateUserApi(id: string, payload: Partial<UserPayload>): Promise<User> {
  const res = await axios.patch(`/api/users/${id}`, payload);
  return res.data;
}
export async function deleteUserApi(id: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/users/${id}`);
  return res.data;
}
