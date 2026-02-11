import { NextRequest, NextResponse } from "next/server";

const CHAT_SERVICE =
  process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://13.49.49.26:5002";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = `${CHAT_SERVICE}/api/v1/${path}${request.nextUrl.search}`;

  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(authHeader && { Authorization: authHeader }),
        Cookie: request.headers.get("cookie") || "",
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
  const url = `${CHAT_SERVICE}/api/v1/${path}`;

  try {
    const authHeader = request.headers.get("authorization");
    const contentType = request.headers.get("content-type");

    let body;
    let headers: HeadersInit = {
      ...(authHeader && { Authorization: authHeader }),
      Cookie: request.headers.get("cookie") || "",
    };

    // Handle FormData (for image uploads)
    if (contentType?.includes("multipart/form-data")) {
      body = await request.formData();
      // Don't set Content-Type, let fetch handle it for FormData
    } else {
      // Handle JSON
      body = JSON.stringify(await request.json());
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
