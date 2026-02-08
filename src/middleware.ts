import { betterFetch } from '@better-fetch/fetch';
import type { Session } from 'better-auth/types';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session & { user: { username?: string } }>('/api/auth/get-session', {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
  });

  const isAuthPage = request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up');
  const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding');

  if (!session) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    // Only redirect to sign-in for protected paths
    const protectedPaths = ['/garage', '/new', '/post', '/settings'];
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
    if (isProtected) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }

  // If user is logged in but doesn't have a username, redirect to onboarding
  if (!session.user.username && !isOnboardingPage && !isAuthPage && request.nextUrl.pathname !== '/api/auth/sign-out') {
    return NextResponse.redirect(new URL('/onboarding/username', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

