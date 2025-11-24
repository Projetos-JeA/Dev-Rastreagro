import api from '../config/api';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  gia?: string;
  ibge?: string;
  ddd?: string;
  siafi?: string;
}

export const buscarCep = async (cep: string): Promise<ViaCepResponse> => {
  const digits = (cep || '').replace(/\D/g, '');
  if (digits.length !== 8) {
    throw new Error('CEP inválido. Use 8 dígitos.');
  }
  const { data } = await api.get<ViaCepResponse>(`/viacep/${digits}`);
  return data;
};

export const viacepService = {
  async buscarCep(cep: string): Promise<ViaCepResponse> {
    return buscarCep(cep);
  },
};
