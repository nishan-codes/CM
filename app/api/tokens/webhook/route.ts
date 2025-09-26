import { NextRequest, NextResponse } from "next/server";
import { addTokens } from "@/lib/tokens";

// Paddle v2 webhook handling (Order completed)
// Verify signature in production.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: Verify webhook signature using Paddle public key
    // Skipping verification here for brevity - implement for production

    const eventType = body?.event_type || body?.eventType || body?.event; // compatibility
    if (!eventType) {
      return NextResponse.json({ error: "Missing event type" }, { status: 400 });
    }

    if (String(eventType).toLowerCase().includes("payment_succeeded") ||
        String(eventType).toLowerCase().includes("transaction.completed") ||
        String(eventType).toLowerCase().includes("order.completed")) {
      const items = body?.data?.items || body?.items || [];
      const customData = body?.data?.custom_data || body?.customData || {};
      const uid: string | undefined = customData?.uid;

      if (!uid) {
        return NextResponse.json({ error: "Missing uid in custom data" }, { status: 400 });
      }

      // Determine tokens credited per item. You can map priceId -> token quantity via env.
      let credited = 0;
      for (const item of items) {
        const priceId = item?.price?.id || item?.priceId;
        const qty = item?.quantity || 1;
        const mappingEnv = process.env.PADDLE_PRICE_TOKEN_MAP || ""; // e.g., price_abc=100,price_def=500
        const map = Object.fromEntries(
          mappingEnv
            .split(",")
            .map((kv) => kv.trim())
            .filter(Boolean)
            .map((kv) => {
              const [k, v] = kv.split("=");
              return [k, Number(v)];
            })
        ) as Record<string, number>;
        const perUnit = map[priceId] || 0;
        credited += perUnit * (qty || 1);
      }

      if (credited > 0) {
        await addTokens(uid, credited);
      }

      return NextResponse.json({ ok: true, credited });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("webhook error", e);
    return NextResponse.json({ error: e?.message || "Webhook error" }, { status: 400 });
  }
}

