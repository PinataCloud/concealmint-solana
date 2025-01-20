import { NextResponse, type NextRequest } from "next/server";
import { filesClient } from "@/lib/pinata";

export async function POST(request: NextRequest) {
  try {
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
