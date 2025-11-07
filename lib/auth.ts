/**
 * Authentication Utilities
 * Handle JWT token storage and management in the browser
 */

const TOKEN_KEY = 'career_admin_token';

export interface AuthUser {
  username: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  expiresIn: number;
}

/**
 * Store auth token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove auth token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Check if user is authenticated (has token)
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Login user with username and password
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/.netlify/functions/auth-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data: LoginResponse = await response.json();

  // Store token
  setAuthToken(data.token);

  return data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const token = getAuthToken();

  if (token) {
    try {
      await fetch('/.netlify/functions/auth-logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with client-side logout anyway
    }
  }

  // Clear token regardless of server response
  clearAuthToken();
}

/**
 * Verify if token is still valid
 */
export async function verifyToken(): Promise<{ valid: boolean; user?: AuthUser }> {
  const token = getAuthToken();

  if (!token) {
    return { valid: false };
  }

  try {
    const response = await fetch('/.netlify/functions/auth-verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      clearAuthToken();
      return { valid: false };
    }

    const data = await response.json();
    return { valid: data.valid, user: data.user };
  } catch (error) {
    console.error('Token verification failed:', error);
    clearAuthToken();
    return { valid: false };
  }
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getAuthToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  // If unauthorized, clear token and throw error
  if (response.status === 401) {
    clearAuthToken();
    throw new Error('Authentication expired');
  }

  return response;
}
