import api from '../config/api';

export const userService = {
  async me() {
    const response = await api.get('/users/me');
    return response.data;
  },
};
