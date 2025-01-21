import { NextResponse, type NextRequest } from "next/server";
import { filesClient } from "@/lib/pinata";
import { verifyAuth } from "@/lib/auth";


export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = authHeader.split(" ")[1];
    await verifyAuth(token);
    const file = (await request.blob()) as unknown as File;
    const { cid } = await filesClient.upload.file(file);
    return NextResponse.json({ cid: cid }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
