import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const COOKIE_NAME = "cms-token";
const USER_COOKIE = "cms-user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(data, { status: response.status });
    }

    const { token, role, name, email } = data.data;

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      data: { role, name, email },
    });

    // Set HTTP-only cookie for the JWT token — NOT accessible to JS
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Set readable cookie for non-sensitive user display info
    res.cookies.set(USER_COOKIE, JSON.stringify({ name, email, role }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: "Service unavailable", data: null },
      { status: 502 },
    );
  }
}
