import api from '../config/api';
import { RegisterSellerRequest } from './authService';

export const companyService = {
  async createOrUpdate(data: RegisterSellerRequest['company']) {
    const response = await api.post('/companies', data);
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },
};
