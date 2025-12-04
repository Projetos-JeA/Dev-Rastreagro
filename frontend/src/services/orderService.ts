import api from '../config/api';

export type OrderStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface OrderResponse {
  id: number;
  buyer_id: number;
  seller_nickname: string;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  shipping_address: string;
  location_city: string;
  location_state: string;
  estimated_delivery?: string;
  tracking_code?: string;
  created_at: string;
  updated_at: string;
}

export const orderService = {
  async getOrders(): Promise<OrderResponse[]> {
    const response = await api.get<OrderResponse[]>('/orders');
    return response.data;
  },

  async getOrderById(orderId: number): Promise<OrderResponse> {
    const response = await api.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  },

  async cancelOrder(orderId: number): Promise<void> {
    await api.patch(`/orders/${orderId}/cancel`);
  },
};
