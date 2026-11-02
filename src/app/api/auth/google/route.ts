import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

  // Redirect to backend Google OAuth endpoint
  const redirectUrl = `${backendUrl}/api/auth/google`;

  return NextResponse.redirect(redirectUrl);
}