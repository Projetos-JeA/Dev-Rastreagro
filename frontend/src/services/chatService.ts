import api from '../config/api';
import { buildApiError } from '../utils/errorMessages';

export interface ConversationUserInfo {
  id: number;
  email: string;
  nickname: string | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  other_user: ConversationUserInfo;
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithMessages {
  id: number;
  other_user: ConversationUserInfo;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface StartConversationRequest {
  other_user_id: number;
}

export interface SendMessageRequest {
  content: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export const chatService = {
  /**
   * Lista todas as conversas do usuário logado
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await api.get<Conversation[]>('/chat/conversations');
      return response.data;
    } catch (error: any) {
      throw buildApiError(error, 'Erro ao buscar conversas');
    }
  },

  /**
   * Inicia ou retorna conversa existente com outro usuário
   */
  async startConversation(otherUserId: number): Promise<Conversation> {
    try {
      const response = await api.post<Conversation>('/chat/conversations', {
        other_user_id: otherUserId,
      });
      return response.data;
    } catch (error: any) {
      throw buildApiError(error, 'Erro ao iniciar conversa');
    }
  },

  /**
   * Busca detalhes de uma conversa com todas as mensagens
   */
  async getConversation(conversationId: number, limit: number = 100, offset: number = 0): Promise<ConversationWithMessages> {
    try {
      const response = await api.get<ConversationWithMessages>(
        `/chat/conversations/${conversationId}`,
        {
          params: { limit, offset },
        }
      );
      return response.data;
    } catch (error: any) {
      throw buildApiError(error, 'Erro ao buscar mensagens');
    }
  },

  /**
   * Envia uma mensagem em uma conversa
   */
  async sendMessage(conversationId: number, content: string): Promise<Message> {
    try {
      const response = await api.post<Message>(
        `/chat/conversations/${conversationId}/messages`,
        { content }
      );
      return response.data;
    } catch (error: any) {
      throw buildApiError(error, 'Erro ao enviar mensagem');
    }
  },

  /**
   * Retorna quantidade de mensagens não lidas
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<UnreadCountResponse>('/chat/unread-count');
      return response.data.unread_count;
    } catch (error: any) {
      throw buildApiError(error, 'Erro ao buscar mensagens não lidas');
      return 0;
    }
  },
};
