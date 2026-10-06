import { NextResponse, type NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(
    "x-hty-locale",
    request.nextUrl.pathname === "/tr" ||
      request.nextUrl.pathname.startsWith("/tr/")
      ? "tr"
      : "en",
  );
  return NextResponse.next({ request: { headers } });
}
export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
