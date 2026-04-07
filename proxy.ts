// Proxy de Next.js 16 — la protección de rutas se maneja en el cliente (app/(app)/layout.tsx)
// Firebase Auth usa localStorage, no cookies, por lo que no podemos verificar sesión aquí
import { NextRequest, NextResponse } from "next/server";

export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
