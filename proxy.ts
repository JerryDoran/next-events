// import { auth } from '@/lib/auth/server';

// export default auth.middleware({
//   // Redirects unauthenticated users to sign-in page
//   loginUrl: '/auth/sign-in',
// });

// export const config = {
//   matcher: [
//     // Protected routes requiring authentication
//     '/dashboard/:path*',
//     '/events/:path*',
//   ],
// };

import { auth } from '@/lib/auth/server';
import { NextRequest } from 'next/server';
const authMiddleware = auth.middleware({
  loginUrl: '/auth/sign-in',
});
export default function middleware(request: NextRequest) {
  if (request.headers.has('Next-Action')) {
    return;
  }
  return authMiddleware(request);
}
export const config = {
  matcher: ['/dashboard/:path*', '/events/:path*'],
};
