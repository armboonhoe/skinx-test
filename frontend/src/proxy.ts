import { NextResponse, type NextRequest } from 'next/server';

const AUTH_COOKIE = 'skinx_token';
const PUBLIC_PATHS = ['/login', '/register'];

const isMalformedPage = (raw: string | null): boolean => {
  if (raw === null || raw === '') return false;
  if (!/^\d+$/.test(raw)) return true;
  return Number.parseInt(raw, 10) < 1;
};

export const proxy = (req: NextRequest): NextResponse => {
  const { pathname, search, searchParams } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!token && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  if (token && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/posts';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Reject malformed `page` param with a real 404 (not a silent fallback to page 1).
  // Done here because Next.js 16's notFound() in Server Components doesn't reliably
  // set the 404 status code on the HTTP response.
  if (pathname === '/posts' && isMalformedPage(searchParams.get('page'))) {
    const url = req.nextUrl.clone();
    url.pathname = '/not-found';
    url.search = '';
    return NextResponse.rewrite(url, { status: 404 });
  }

  return NextResponse.next();
};

// Next 16: proxy always runs on Node.js — `runtime` is no longer allowed here.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
