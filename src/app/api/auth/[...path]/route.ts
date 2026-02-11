import { NextRequest, NextResponse } from "next/server";

const USER_SERVICE =
  process.env.NEXT_PUBLIC_USER_SERVICE || "http://13.49.49.26:5000";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = `${USER_SERVICE}/api/v1/${path}${request.nextUrl.search}`;

  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(authHeader && { Authorization: authHeader }),
        Cookie: request.headers.get("cookie") || "",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const body = await request.json();
  const url = `${USER_SERVICE}/api/v1/${path}`;

  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...(authHeader && { Authorization: authHeader }),
        Cookie: request.headers.get("cookie") || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
