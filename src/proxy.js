import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export default async function proxy(request) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Verificamos la sesión
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  
  // Si estamos en /login, permitir el acceso sin verificar autenticación
  if (pathname.startsWith('/login')) {
    // Si hay usuario autenticado y está en login, redirigir al dashboard
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    // Si no hay usuario, permitir acceso a /login
    return supabaseResponse;
  }

  // Si no hay usuario y NO está en /login, redirigir a /login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono del sitio)
     * - archivos en public (imágenes, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

