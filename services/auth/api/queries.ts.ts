//services/auth/api/queries.ts

import { User } from '@/types/user';
import axios from 'axios';

export async function fetchUserProfileApi(id: string): Promise<User> {
  const res = await axios.get(`/api/users/${id}`);
  return res.data;
}
