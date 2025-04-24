import { NextResponse } from "next/server";

export async function POST() {
  try {
    // No need to call the backend for logout since we're using localStorage
    // Just return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/v1/auth/logout:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
