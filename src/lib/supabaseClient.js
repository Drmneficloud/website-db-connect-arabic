
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmuqykvmkomzuykkvnpt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXF5a3Zta29tenV5a2t2bnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MjE3NDAsImV4cCI6MjA2NDM5Nzc0MH0.wijNq8fN2-4vJ_ZLEwPobL-zEF7RBMGTiL5CxKuXXvo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
