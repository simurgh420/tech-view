//services/auth/api/mutations.ts

import { User, UserPayload } from '@/types/user';
import axios from 'axios';

export async function registerUserApi(payload: UserPayload): Promise<User> {
  const res = await axios.post('/api/auth/register', payload);
  return res.data;
}
