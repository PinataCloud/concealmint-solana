import { NextResponse, type NextRequest } from "next/server";
import { ipfsClient } from "@/lib/pinata";

export async function POST(request: NextRequest) {

  try {
    const file = (await request.blob()) as unknown as File;
    const { IpfsHash } = await ipfsClient.upload.file(file);
    return NextResponse.json({ cid: IpfsHash }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
