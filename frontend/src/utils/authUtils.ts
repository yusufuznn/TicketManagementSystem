export interface TokenPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  exp: number;
  [key: string]: any; 
}

export class AuthUtils {
  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  static removeToken(): void {
    localStorage.removeItem('token');
  }

  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  static decodeToken(token: string): TokenPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  static getCurrentUser(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return this.decodeToken(token);
    } catch {
      return null;
    }
  }

  static getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || user?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
  }

  static getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.sub || user?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"] || null;
  }

  static hasRole(requiredRoles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? requiredRoles.includes(userRole) : false;
  }

  static isAuthenticated(): boolean {
    return this.isTokenValid();
  }
} 