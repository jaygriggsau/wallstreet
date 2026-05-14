import { auth } from "@/auth";

export default auth((req) => {
  const isProtected = ["/portfolio"].some((p) => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !req.auth) {
    const url = new URL("/login", req.nextUrl);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/portfolio/:path*"],
};
