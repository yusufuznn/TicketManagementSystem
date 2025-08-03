import { AuthUtils } from '../utils/authUtils';
import { ErrorHandler, ApiError } from '../utils/errorHandler';

const API_BASE_URL = 'http://localhost:5257/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = AuthUtils.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP ${response.status}`);
      }

      // Boş cevaplar için
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return {} as T;
      }
    } catch (error) {
      const apiError = ErrorHandler.handleApiError(error);
      throw apiError;
    }
  }

  // Kimlik doğrulama
  async login(email: string, password: string): Promise<{ token: string }> {
    return this.request<{ token: string }>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, sifre: password }),
    });
  }

  async register(userData: {
    adSoyad: string;
    email: string;
    sifre: string;
    rol?: string;
  }): Promise<void> {
    return this.request<void>('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return this.request<void>('/Auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ eskiSifre: oldPassword, yeniSifre: newPassword }),
    });
  }

  async getPersonelList(): Promise<Array<{ id: number; adSoyad: string; email: string; rol: string }>> {
    return this.request<Array<{ id: number; adSoyad: string; email: string; rol: string }>>('/Auth/personel-list');
  }

  // Ticket 
  async getTickets(): Promise<any[]> {
    const userRole = AuthUtils.getUserRole();
    const endpoint = userRole === 'Musteri' ? '/Ticket/my' : '/Ticket';
    return this.request<any[]>(endpoint);
  }

  async getAssignedTickets(): Promise<any[]> {
    return this.request<any[]>('/Ticket/assigned-to-me');
  }

  async createTicket(ticketData: {
    baslik: string;
    aciklama: string;
    onem: string;
  }): Promise<any> {
    return this.request<any>('/Ticket', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(id: number, ticketData: {
    baslik: string;
    aciklama: string;
    onem: string;
    durum: string;
  }): Promise<any> {
    return this.request<any>(`/Ticket/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    });
  }

  async assignTicket(id: number, personelId: number): Promise<any> {
    return this.request<any>(`/Ticket/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ atananPersonelId: personelId }),
    });
  }

  async deleteTicket(id: number): Promise<void> {
    return this.request<void>(`/Ticket/${id}`, {
      method: 'DELETE',
    });
  }

  async getTicketStatistics(): Promise<any> {
    return this.request<any>('/Ticket/statistics');
  }

  async getFilteredStatistics(params: {
    start?: string;
    end?: string;
    durum?: string;
    personelId?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const query = queryParams.toString();
    const endpoint = `/Ticket/filtered-statistics${query ? `?${query}` : ''}`;
    return this.request<any>(endpoint);
  }

  async getPersonelStats(): Promise<any[]> {
    return this.request<any[]>('/Ticket/personel-stats');
  }

  async exportCsv(params: {
    start?: string;
    end?: string;
    durum?: string;
    personelId?: number;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const query = queryParams.toString();
    const endpoint = `/Ticket/export-csv${query ? `?${query}` : ''}`;
    
    const token = AuthUtils.getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('CSV export failed');
    }

    return response.blob();
  }

  // Yorumlar
  async getComments(ticketId: number): Promise<any[]> {
    return this.request<any[]>(`/Yorum/${ticketId}`);
  }

  async addComment(ticketId: number, yorum: string): Promise<any> {
    return this.request<any>('/Yorum', {
      method: 'POST',
      body: JSON.stringify({ ticketId, yorum }),
    });
  }

  // Zaman çizelgesi
  async getTimeline(ticketId: number): Promise<any[]> {
    return this.request<any[]>(`/Timeline/${ticketId}`);
  }

  // Dosya yükleme
  async getAttachments(ticketId: number): Promise<any[]> {
    return this.request<any[]>(`/Ek/${ticketId}`);
  }

  async uploadAttachment(ticketId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticketId', ticketId.toString());

    const token = AuthUtils.getToken();
    const response = await fetch(`${API_BASE_URL}/Ek`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Upload failed');
    }

    return response.json();
  }

  async deleteAttachment(id: number): Promise<void> {
    return this.request<void>(`/Ek/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(); 