import { NextRequest, NextResponse } from "next/server";

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = `${CHAT_SERVICE_URL}/api/v1/${path.join("/")}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch from chat service" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = `${CHAT_SERVICE_URL}/api/v1/${path.join("/")}`;

  try {
    const contentType = request.headers.get("content-type");

    let body;
    if (contentType?.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      body = await request.json();
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
        ...(contentType?.includes("application/json") && {
          "Content-Type": "application/json",
        }),
      },
      body: contentType?.includes("application/json")
        ? JSON.stringify(body)
        : (body as FormData),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to post to chat service" },
      { status: 500 }
    );
  }
}
