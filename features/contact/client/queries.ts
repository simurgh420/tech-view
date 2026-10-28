// services/contact/api/queries.ts

import axios from 'axios';

export async function GetContactsApi() {
  const { data } = await axios.get('/api/contact');
  return data;
}

export async function GetContactByIdApi(id: string) {
  const { data } = await axios.get(`/api/contact/${id}`);
  return data;
}
