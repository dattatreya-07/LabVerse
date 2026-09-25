import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pbqgemxtctkocmqxfhbu.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_tsHzx3tNdfu4nTCu-cw15w_X51o3FL_';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
