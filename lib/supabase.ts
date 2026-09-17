/**
 * Supabase connection used by the website.
 *
 * The publishable key is intentionally client-safe. Database security must
 * still be enforced with Supabase RLS policies; never put a service_role/
 * secret key in this file or in browser code.
 */

const DEFAULT_SUPABASE_URL = 'https://jqaswzjeyuyhtwcjnusr.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9Bhmik1eaSgOmed0hAYRkQ_a3yFIWuW';

const ACCESS_TOKEN_KEY = 'falbazar_auth_access_token';
const REFRESH_TOKEN_KEY = 'falbazar_auth_refresh_token';

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

/**
 * Small REST helper so the project can talk to Supabase immediately without
 * changing the existing UI or data flow. Tables can be wired through this
 * helper after the database schema is created.
 */
export async function supabaseRest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const cleanPath = path.replace(/^\/+/, '');
  const url = `${SUPABASE_URL}/rest/v1/${cleanPath}`;

  const makeHeaders = (token?: string) => {
    const headers = new Headers(options.headers);
    headers.set('apikey', SUPABASE_PUBLISHABLE_KEY);
    headers.set('Authorization', `Bearer ${token || SUPABASE_PUBLISHABLE_KEY}`);
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  };

  const accessToken = typeof window !== 'undefined'
    ? sessionStorage.getItem(ACCESS_TOKEN_KEY)
    : null;

  let response = await fetch(url, {
    ...options,
    cache: options.cache ?? 'no-store',
    headers: makeHeaders(accessToken || undefined),
  });

  // Refresh an expired user JWT once, then retry the original request.
  if (response.status === 401 && typeof window !== 'undefined') {
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        const refreshed = await supabaseAuthRequest<SupabaseAuthSession>(
          'token?grant_type=refresh_token',
          { refresh_token: refreshToken },
        );
        if (refreshed.access_token) {
          sessionStorage.setItem(ACCESS_TOKEN_KEY, refreshed.access_token);
          if (refreshed.refresh_token) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshed.refresh_token);
          response = await fetch(url, {
            ...options,
            cache: options.cache ?? 'no-store',
            headers: makeHeaders(refreshed.access_token),
          });
        }
      } catch {
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }
  }

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(
      `Supabase request failed (${response.status}): ${message || response.statusText}`,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}


export interface SupabaseAuthSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null };
}

export function saveAuthSession(session: SupabaseAuthSession) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  if (session.refresh_token) sessionStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
}

export function getStoredAccessToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem('falbazar_user');
}


async function supabaseAuthRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.msg || data?.message || data?.error_description || data?.error || `Supabase Auth failed (${response.status})`;
    throw new Error(String(message));
  }
  return data as T;
}

export async function supabaseSignUp(email: string, password: string, metadata: Record<string, unknown>) {
  return supabaseAuthRequest<SupabaseAuthSession>('signup', { email, password, data: metadata });
}

export async function supabaseSignIn(email: string, password: string) {
  return supabaseAuthRequest<SupabaseAuthSession>('token?grant_type=password', { email, password });
}

export async function supabaseResetPasswordForEmail(email: string, redirectTo?: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, ...(redirectTo ? { redirect_to: redirectTo } : {}) }),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(data?.msg || data?.message || data?.error_description || data?.error || 'Password reset request failed'));
  }
}

export async function supabaseGetProfile(accessToken: string, userId: string) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,full_name,phone,email,role,created_at`,
    {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    },
  );
  if (!response.ok) throw new Error(`Profile request failed (${response.status})`);
  const rows = (await response.json()) as Array<Record<string, unknown>>;
  return rows[0] ?? null;
}

export async function supabaseSignOut(accessToken: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  }).catch(() => undefined);
}
