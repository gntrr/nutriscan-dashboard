/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user?: import('@supabase/supabase-js').User;
    nakes?: import('./lib/auth').NakesAccount;
    supabase?: import('@supabase/supabase-js').SupabaseClient;
  }
}
