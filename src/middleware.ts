import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Public routes (tidak perlu authentication)
  const publicRoutes = ['/', '/login'];
  if (publicRoutes.includes(pathname)) {
    return next();
  }

  // API routes - let them handle their own auth
  if (pathname.startsWith('/api/')) {
    return next();
  }

  // Protected routes (require nakes role)
  if (pathname.startsWith('/dashboard')) {
    try {
      // Get session dari supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // Redirect to login if no session
      if (sessionError || !session || !session.user) {
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
        // Logout and redirect
        await supabase.auth.signOut();
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
