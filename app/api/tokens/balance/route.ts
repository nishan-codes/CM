import { NextResponse } from "next/server";
import { getUidFromCookie, getBalance } from "@/lib/tokens";

export async function GET() {
  try {
    const uid = await getUidFromCookie();
    const balance = await getBalance(uid);
    return NextResponse.json({ uid, balance });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to get balance" }, { status: 400 });
  }
}

