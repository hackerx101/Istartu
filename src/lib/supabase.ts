import { createClient } from '@supabase/supabase-js';

// The anon key and project url provided by the user
const supabaseUrl = 'https://kqhjubuhuwofhgdvosnk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxaGp1YnVodXdvZmhnZHZvc25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTEyMTcsImV4cCI6MjA5OTI2NzIxN30.ML14yDvi6aPSprv21T_cmzcIyaUo6tfHTZ8Cr1C0BbY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
