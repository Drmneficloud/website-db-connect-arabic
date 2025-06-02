import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://otvyrcmwshxheiwlfqgw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90dnlyY213c2h4aGVpd2xmcWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNzAxODgsImV4cCI6MjA2Mzc0NjE4OH0.7n3nNgWX6qcS-2mARDwVhxtP2ikWbY-6Ih9lPGGhZuc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);