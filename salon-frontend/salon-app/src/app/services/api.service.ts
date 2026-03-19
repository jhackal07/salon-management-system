import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  get<T>(endpoint: string) {
    return this.http.get<T>(this.baseUrl + endpoint);
  }

  /** GET with Authorization Bearer token (for logged-in user endpoints) */
  getWithAuth<T>(endpoint: string) {
    const token = this.auth.getToken();
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    return this.http.get<T>(this.baseUrl + endpoint, { headers });
  }

  post<T>(endpoint: string, data: unknown) {
    return this.http.post<T>(this.baseUrl + endpoint, data);
  }

  put<T>(endpoint: string, data: unknown) {
    return this.http.put<T>(this.baseUrl + endpoint, data);
  }

  patch<T>(endpoint: string, data: unknown) {
    return this.http.patch<T>(this.baseUrl + endpoint, data);
  }

  delete(endpoint: string) {
    return this.http.delete(this.baseUrl + endpoint);
  }
}
