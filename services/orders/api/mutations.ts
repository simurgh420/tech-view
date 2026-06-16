import { CheckoutPayloadType } from '@/lib/validation/checkout';
import axios from 'axios';

export async function createOrderApi(payload: CheckoutPayloadType) {
  const res = await axios.post('/api/orders', payload);
  return res.data;
}
