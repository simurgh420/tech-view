import { CheckoutPayloadType } from '@/lib/validation/checkout';
import axios from 'axios';

export async function createOrderApi(payload: CheckoutPayloadType) {
  const res = await axios.post('/api/orders', payload);
  return res.data;
}
export async function updateOrderStatusApi(orderId: string, status: string) {
  const res = await axios.patch(`/api/admin/orders/${orderId}`, { status });
  return res.data;
}
export async function cancelOrderApi(orderId: string) {
  const res = await axios.patch(`/api/orders/${orderId}`);
  return res.data.order;
}
