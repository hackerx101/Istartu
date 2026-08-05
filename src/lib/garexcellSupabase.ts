import { createClient } from '@supabase/supabase-js';

// Placeholder for Garexcell secondary supabase project
// @ts-ignore
const garexcellUrl = import.meta.env.VITE_GAREXCELL_SUPABASE_URL || 'https://placeholder.supabase.co';
// @ts-ignore
const garexcellAnonKey = import.meta.env.VITE_GAREXCELL_SUPABASE_ANON_KEY || 'placeholder-key';

export const garexcellSupabase = createClient(garexcellUrl, garexcellAnonKey);
