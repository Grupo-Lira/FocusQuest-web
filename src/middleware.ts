import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/signin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("focusquest.authToken")?.value;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas, EXCETO nas que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos do Next)
     * - _next/image (otimização de imagens do Next)
     * - favicon.ico (ícone do site)
     * - img (sua pasta public/img)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|img).*)",
  ],
};