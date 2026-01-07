// services/contact/api/queries.ts

import axios from 'axios';

export async function apiGetContacts() {
  const { data } = await axios.get('/api/contact');
  return data;
}

export async function apiGetContactById(id: string) {
  const { data } = await axios.get(`/api/contact/${id}`);
  return data;
}
