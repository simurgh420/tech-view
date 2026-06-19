import axios from 'axios';

export async function getOrderByIdApi(orderId: string) {
  const res = await axios.get(`/api/orders/${orderId}`);
  return res.data;
}

export async function getUserOrdersApi() {
  const res = await axios.get('/api/orders');
  return res.data;
}
