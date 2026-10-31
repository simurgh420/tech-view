import axios from 'axios';

export async function getOrderByIdApi(orderId: string) {
  const res = await axios.get(`/api/orders/${orderId}`);
  return res.data.order;
}

export async function getUserOrdersApi() {
  const res = await axios.get('/api/orders');
  return res.data;
}

export async function fetchAdminOrdersApi() {
  const res = await axios.get('/api/admin/orders');
  return res.data;
}

export async function fetchAdminOrderByIdApi(orderId: string) {
  const res = await axios.get(`/api/admin/orders/${orderId}`);
  return res.data;
}
