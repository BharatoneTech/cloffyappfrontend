// src/api/user/orders.js
import client from "../axiosClient";

// POST /api/orders
export const placeOrder = (orderPayload) =>
  client.post("/orders", orderPayload);

// GET /api/orders/my  (for history page)
export const fetchMyOrders = () => client.get("/orders/my");

// GET /api/orders/:id
export const fetchOrderById = (id) => client.get(`/orders/${id}`);

// GET /api/orders/:id/full  (order + items + addons)
export const fetchOrderWithItems = (id) => client.get(`/orders/${id}/full`);

// ADMIN: get all orders
export const fetchAllOrdersAdmin = () => client.get("/orders");

// ADMIN: update order status
export const updateOrderStatusAdmin = (id, status) =>
  client.patch(`/orders/${id}/status`, { status });
