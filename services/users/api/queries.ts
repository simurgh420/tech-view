// services/users/api/queries.ts

import { User } from '@/types/user';
import axios from 'axios';

export async function fetchUsers(): Promise<User[]> {
  const res = await axios.get('/api/users');
  return res.data;
}
export async function fetchUserById(id: string): Promise<User> {
  const res = await axios.get(`/api/users/${id}`);
  return res.data;
}
