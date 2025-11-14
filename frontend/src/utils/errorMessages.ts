import { Alert } from 'react-native';

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const normalizeDetail = (detail: unknown): string => {
  if (!detail) {
    return '';
  }
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map(item => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        if (item.msg && item.loc) {
          return `${item.loc.join('.')}: ${item.msg}`;
        }
        if (item.msg) return item.msg;
        return JSON.stringify(item);
      })
      .filter(Boolean)
      .join('\n');
  }
  if (typeof detail === 'object' && 'msg' in detail) {
    return String((detail as { msg: unknown }).msg);
  }
  return String(detail);
};

export const buildApiError = (error: any, fallbackMessage: string): ApiError => {
  const status = error?.response?.status as number | undefined;
  const detail = normalizeDetail(error?.response?.data?.detail);
  const message = detail || fallbackMessage;
  return new ApiError(message, status);
};

export const showApiError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof ApiError) {
    const statusText = error.status ? `\nCódigo: ${error.status}` : '';
    Alert.alert('Erro', `${error.message}${statusText}`);
    return;
  }

  if (error instanceof Error) {
    Alert.alert('Erro', `${error.message}`);
    return;
  }

  Alert.alert('Erro', fallbackMessage);
};
