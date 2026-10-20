'use client';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from './env';

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Cliente usado no navegador (painel admin). */
export function getBrowserClient() {
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
