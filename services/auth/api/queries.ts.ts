//services/auth/api/queries.ts

import axios from 'axios';
import { User } from 'better-auth';

export async function fetchUserProfileApi(id: string): Promise<User> {
  const res = await axios.get(`/api/users/${id}`);
  return res.data;
}
