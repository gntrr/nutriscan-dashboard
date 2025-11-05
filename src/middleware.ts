import { defineMiddleware } from 'astro:middleware';
import { createServerSupabaseClient } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Public routes (tidak perlu authentication)
  const publicRoutes = ['/', '/login'];
  if (publicRoutes.includes(pathname)) {
    return next();
  }

  // Skip auth for auth API routes only
  if (pathname.startsWith('/api/auth/')) {
    return next();
  }

  // Protected routes & API routes (require nakes role)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
    try {
      // Create supabase client with cookie support
      const supabase = createServerSupabaseClient(context.cookies);
      
      // Get session dari supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // Handle unauthorized
      if (sessionError || !session || !session.user) {
        // For API routes, return JSON error
        if (pathname.startsWith('/api/')) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized - No session' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
        // For dashboard routes, redirect to login
        return context.redirect('/login?error=unauthorized');
      }

      // Check if user is nakes
      const { data: nakesData, error: nakesError } = await supabase
        .from('nakes_accounts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();

      if (nakesError || !nakesData) {
        // Logout
        await supabase.auth.signOut();
        
        // For API routes, return JSON error
        if (pathname.startsWith('/api/')) {
          return new Response(
            JSON.stringify({ error: 'Akun Anda tidak terdaftar sebagai tenaga kesehatan. Log error: ' + (nakesError?.message || 'User not found in nakes_accounts') }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
        // For dashboard routes, redirect to login
        return context.redirect('/login?error=not_nakes');
      }

      // Admin-only routes
      if (pathname.startsWith('/dashboard/admin') && nakesData.role !== 'admin') {
        return context.redirect('/dashboard?error=forbidden');
      }

      // Store nakes data in locals for use in pages
      context.locals.nakes = nakesData;
      context.locals.user = session.user;
    } catch (error) {
      console.error('Middleware error:', error);
      return context.redirect('/login?error=server_error');
    }
  }

  return next();
});
