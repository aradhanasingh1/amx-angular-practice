import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface DecodedToken {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<any>;
  private tokenSubject: BehaviorSubject<string | null>;
  private isBrowser: boolean;

  public currentUser$: Observable<any>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    this.tokenSubject = new BehaviorSubject<string | null>(this.getToken());

    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isAuthenticated$ = this.tokenSubject.asObservable().pipe(
      map(token => !!token)
    );
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          // Store tokens
          this.setToken(response.token);
          this.setRefreshToken(response.refreshToken);

          // Store user info
          this.currentUserSubject.next(response.user);
          if (this.isBrowser) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }

          return response;
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear tokens and user data
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }

    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);

    // Navigate to login
    this.router.navigate(['/login']);
  }

  /**
   * Register new user
   */
  register(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        map(response => {
          this.setToken(response.token);
          this.setRefreshToken(response.refreshToken);
          this.currentUserSubject.next(response.user);
          if (this.isBrowser) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          return response;
        })
      );
  }

  /**
   * Refresh JWT token
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        map(response => {
          this.setToken(response.token);
          this.tokenSubject.next(response.token);
          return response;
        })
      );
  }

  /**
   * Forgot password - request password reset
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot`, { email });
  }

  /**
   * Get current user
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  /**
   * Get JWT Token
   */
  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem('token');
  }

  /**
   * Set JWT Token
   */
  private setToken(token: string): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  /**
   * Get Refresh Token
   */
  private getRefreshToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem('refreshToken');
  }

  /**
   * Set Refresh Token
   */
  private setRefreshToken(token: string): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem('refreshToken', token);
  }

  /**
   * Decode JWT token
   */
  decodeToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded) {
      return true;
    }

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  }

  /**
   * Get user from localStorage
   */
  private getUserFromStorage(): any {
    if (!this.isBrowser) {
      return null;
    }
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
