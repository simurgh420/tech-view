// services/contact/api/mutations.ts

import { ContactFormValues } from '@/lib/validation/contact';
import axios from 'axios';

export async function CreateContactApi(payload: ContactFormValues) {
  const { data } = await axios.post('/api/contact', payload);
  return data;
}

export async function DeleteContactApi(id: string) {
  const { data } = await axios.delete(`/api/contact/${id}`);
  return data;
}
