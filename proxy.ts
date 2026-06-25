import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token = req.cookies.get("token");

  const isAdmin = path.startsWith("/admin");

  if (path === "/") {
    return NextResponse.redirect(new URL("/site", req.url));
  }

  // if (isAdmin && !token) {
  //   return NextResponse.redirect(new URL("/site/login", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};