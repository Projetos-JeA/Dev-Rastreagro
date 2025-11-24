import api from '../config/api';

export interface CnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral?: number;
  descricao_situacao?: string;
  data_inicio_atividade?: string;
  cnae_fiscal_principal?: string;
  descricao_cnae?: string;
  endereco: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  telefone?: string;
  email?: string;
  inscricao_estadual?: string;
}

export const buscarCnpj = async (cnpj: string): Promise<CnpjResponse> => {
  const digits = (cnpj || '').replace(/\D/g, '');
  if (digits.length !== 14) {
    throw new Error('CNPJ inválido. Use 14 dígitos.');
  }
  const { data } = await api.get<CnpjResponse>(`/cnpj/${digits}`);
  return data;
};

export const cnpjService = {
  async buscarCnpj(cnpj: string): Promise<CnpjResponse> {
    return buscarCnpj(cnpj);
  },
};

