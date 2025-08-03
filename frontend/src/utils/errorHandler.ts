export interface ApiError {
  message: string;
  statusCode?: number;
  details?: string;
}

export class ErrorHandler {
  static handleApiError(error: any): ApiError {
    if (error.response) {
      // Sunucu hatası
      return {
        message: error.response.data?.message || 'Sunucu hatası oluştu',
        statusCode: error.response.status,
        details: error.response.data?.details
      };
    } else if (error.request) {
      // Network hatası
      return {
        message: 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.',
        statusCode: 0
      };
    } else {
      // Diğer hatalar
      return {
        message: error.message || 'Beklenmeyen bir hata oluştu',
        statusCode: 500
      };
    }
  }

  static showErrorToast(error: ApiError, showToast: (message: string, type: 'success' | 'error') => void) {
    showToast(error.message, 'error');
  }

  static logError(error: ApiError, context?: string) {
    console.error(`[${context || 'App'}] Error:`, error);
    
  }
} 