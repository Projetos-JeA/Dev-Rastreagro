import api from '../config/api';

export interface QuotationResponse {
  id: number;
  seller_id: number;
  seller_type: string;
  title: string;
  description?: string;
  category: 'agriculture' | 'livestock' | 'service' | 'both';
  product_type?: string;
  location_city?: string;
  location_state?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  expires_at?: string;
  image_url?: string;
  images?: string[];
  free_shipping: boolean;
  discount_percentage?: number;
  installments?: number;
  stock?: number;
  status: string;
  created_at: string;
  updated_at: string;
  seller_nickname?: string;
}

export const quotationService = {
  /**
   * Busca cotações relevantes para o comprador logado
   * Filtra baseado nas atividades do produtor
   */
  async getRelevantQuotations(): Promise<QuotationResponse[]> {
    try {
      const response = await api.get<QuotationResponse[]>('/quotations/relevant');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar cotações relevantes:', error);
      throw error;
    }
  },

  /**
   * Busca todas as cotações ativas (sem filtro)
   */
  async getAllQuotations(): Promise<QuotationResponse[]> {
    try {
      const response = await api.get<QuotationResponse[]>('/quotations');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar todas as cotações:', error);
      throw error;
    }
  },

  /**
   * Busca detalhes de uma cotação específica
   */
  async getQuotationById(quotationId: number): Promise<QuotationResponse> {
    try {
      const response = await api.get<QuotationResponse>(`/quotations/${quotationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar cotação:', error);
      throw error;
    }
  },
};

