/**
 * Supabase connection used by the website.
 *
 * The publishable key is intentionally client-safe. Database security must
 * still be enforced with Supabase RLS policies; never put a service_role/
 * secret key in this file or in browser code.
 */

const DEFAULT_SUPABASE_URL = 'https://jqaswzjeyuyhtwcjnusr.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9Bhmik1eaSgOmed0hAYRkQ_a3yFIWuW';

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

  const headers = new Headers(options.headers);
  headers.set('apikey', SUPABASE_PUBLISHABLE_KEY);
  headers.set('Authorization', `Bearer ${SUPABASE_PUBLISHABLE_KEY}`);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  const response = await fetch(url, {
    ...options,
    cache: options.cache ?? 'no-store',
    headers,
  });

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
