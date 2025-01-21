import { jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET_KEY!;

export async function getEncodedKey() {
  const encoder = new TextEncoder();
  return encoder.encode(SECRET_KEY);
}

export async function verifyAuth(token: string) {
  try {
    const { payload } = await jwtVerify(token, await getEncodedKey());
    return payload;
  } catch (err) {
    throw new Error("Your token has expired.");
  }
}
