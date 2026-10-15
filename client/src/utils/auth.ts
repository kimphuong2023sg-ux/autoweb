// src/utils/auth.ts
// Quản lý phiên đăng nhập độc lập giữa User (Tool) và Quản Trị Viên (Admin)

export interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  role: 'admin' | 'member';
  lastLoginAt?: string;
  lastLoginIp?: string;
}

const USER_TOKEN_KEY = 'autoweb_user_token';
const USER_PROFILE_KEY = 'autoweb_user_profile';

const ADMIN_TOKEN_KEY = 'autoweb_admin_token';
const ADMIN_PROFILE_KEY = 'autoweb_admin_profile';

export type AuthScope = 'auto' | 'admin' | 'user';

export function resolveScope(scope: AuthScope = 'auto', url = ''): 'admin' | 'user' {
  if (scope === 'admin' || scope === 'user') return scope;

  if (url && (url.startsWith('/api/admin') || url.includes('/api/admin/'))) {
    return 'admin';
  }

  try {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/admin' || path.startsWith('/admin/') || hash === '#/admin' || hash.startsWith('#/admin/')) {
      return 'admin';
    }
  } catch (e) {}

  return 'user';
}

function getKey(type: 'token' | 'user', scope: AuthScope = 'auto', url = ''): string {
  const s = resolveScope(scope, url);
  if (type === 'token') {
    return s === 'admin' ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY;
  }
  return s === 'admin' ? ADMIN_PROFILE_KEY : USER_PROFILE_KEY;
}

export function getToken(scope: AuthScope = 'auto'): string {
  try {
    const key = getKey('token', scope);
    const token = localStorage.getItem(key);
    if (token) return token;

    // Fallback: nếu admin đang ở tool mà có token admin
    if (scope === 'auto' || scope === 'user') {
      const adminTok = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (adminTok) return adminTok;
    }
    return '';
  } catch (e) {
    return '';
  }
}

export function setToken(token: string, scope: AuthScope = 'auto'): void {
  try {
    const key = getKey('token', scope);
    localStorage.setItem(key, token);
  } catch (e) {}
}

export function removeToken(scope: AuthScope = 'auto'): void {
  try {
    const key = getKey('token', scope);
    localStorage.removeItem(key);
  } catch (e) {}
}

export function getUser(scope: AuthScope = 'auto'): AuthUser | null {
  try {
    const key = getKey('user', scope);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    // Fallback nếu có admin profile
    if (scope === 'auto' || scope === 'user') {
      const adminRaw = localStorage.getItem(ADMIN_PROFILE_KEY);
      if (adminRaw) return JSON.parse(adminRaw);
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function setUser(user: AuthUser, scope: AuthScope = 'auto'): void {
  try {
    const key = getKey('user', scope);
    localStorage.setItem(key, JSON.stringify(user));
  } catch (e) {}
}

export function removeUser(scope: AuthScope = 'auto'): void {
  try {
    const key = getKey('user', scope);
    localStorage.removeItem(key);
  } catch (e) {}
}

export function clearAuth(scope: AuthScope = 'auto'): void {
  removeToken(scope);
  removeUser(scope);
}

export const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL || '').replace(/\/+$/, '');

export function getApiUrl(url = ''): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

export async function authFetch(url: string, options: RequestInit = {}, scope: AuthScope = 'auto'): Promise<Response> {
  const fullUrl = getApiUrl(url);
  const resolvedScope = resolveScope(scope, fullUrl);
  const token = getToken(resolvedScope);
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    let errJson: any = null;
    try {
      const clone = response.clone();
      errJson = await clone.json();
    } catch (e) {}

    if (errJson && errJson.code === 'SESSION_KICKED') {
      window.dispatchEvent(
        new CustomEvent('session_kicked', {
          detail: {
            scope: resolvedScope,
            message: errJson.message || errJson.error || 'Tài khoản của bạn đã được đăng nhập từ một thiết bị khác!',
          },
        }),
      );
    } else if (errJson && (errJson.code === 'UNAUTHORIZED' || errJson.code === 'TOKEN_INVALID' || errJson.code === 'USER_BLOCKED')) {
      window.dispatchEvent(
        new CustomEvent('auth_expired', {
          detail: {
            scope: resolvedScope,
            message: errJson.message || errJson.error || 'Phiên làm việc đã hết hạn!',
          },
        }),
      );
    }
  }

  return response;
}
