import { Injectable } from '@angular/core';

const TOKEN_KEY = 'salon_token';
const USER_KEY = 'salon_user';

export interface LoggedInUser {
  id?: number;
  email: string;
  name?: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;
  private user: LoggedInUser | null = null;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
      const stored = localStorage.getItem(USER_KEY);
      this.user = stored ? (JSON.parse(stored) as LoggedInUser) : null;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get currentUser(): LoggedInUser | null {
    return this.user;
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  getToken(): string | null {
    return this.token;
  }

  login(token: string, user: LoggedInUser): void {
    this.token = token;
    this.user = user;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
}
