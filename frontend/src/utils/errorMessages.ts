import { Alert } from 'react-native';

export class ApiError extends Error {
  status?: number;
  responseData?: any;

  constructor(message: string, status?: number, responseData?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.responseData = responseData;
  }
}

function normalizeDetail(detail: unknown): string {
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
}

export function buildApiError(error: any, fallbackMessage: string): ApiError {
  const status = error?.response?.status as number | undefined;
  const responseData = error?.response?.data;
  const detail = normalizeDetail(responseData?.detail);
  const message = detail || fallbackMessage;
  return new ApiError(message, status, responseData);
}

export function showApiError(error: unknown, fallbackMessage: string): void {
  if (error instanceof ApiError) {
    Alert.alert('Erro', error.message);
    return;
  }

  if (error instanceof Error) {
    Alert.alert('Erro', error.message);
    return;
  }

  Alert.alert('Erro', fallbackMessage);
}
