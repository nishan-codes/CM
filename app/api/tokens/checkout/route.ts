import { NextRequest, NextResponse } from "next/server";
import { getUidFromCookie } from "@/lib/tokens";

// This endpoint returns Paddle Checkout configuration for client-side overlay
// Client should use Paddle.js with the returned payload
export async function POST(req: NextRequest) {
  try {
    const uid = await getUidFromCookie();
    const { priceId, quantity } = await req.json();

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json({ error: "priceId required" }, { status: 400 });
    }

    const qty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;

    // Pass-through metadata so webhook can credit tokens
    // For Paddle v2, client uses the provided customer info and customData
    const payload = {
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "dark",
        },
        items: [
          {
            priceId,
            quantity: qty,
          },
        ],
        customer: {
          email: undefined,
        },
        customData: {
          uid,
        },
      },
      environment: process.env.PADDLE_ENVIRONMENT || "sandbox",
      vendorId: process.env.PADDLE_VENDOR_ID,
      clientToken: process.env.PADDLE_CLIENT_TOKEN, // used by Paddle.js
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to init checkout" }, { status: 400 });
  }
}

