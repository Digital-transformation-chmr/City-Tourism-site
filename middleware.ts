import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token = req.cookies.get("token");

  const isAdmin = path.startsWith("/admin");

  // redirect root
  if (path === "/") {
    return NextResponse.redirect(new URL("/site", req.url));
  }
  

  // protect admin
//   if (isAdmin && !token) {
//     return NextResponse.redirect(new URL("/site/login", req.url));
//   }

  return NextResponse.next();
}