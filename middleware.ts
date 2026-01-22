import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/ru') && !pathname.startsWith('/ua') && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !/\.[\w]+$/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/ua${pathname}`;
    return NextResponse.rewrite(url);
  }

  return createMiddleware({
    locales: ['ru', 'ua'],
    defaultLocale: 'ua',
    localePrefix: 'as-needed', // ua без префикса, ru с /ru
  })(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'], // Исключаем _next и файлы с расширениями
};