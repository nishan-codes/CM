"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TokensBadge() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/tokens/balance", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch balance");
      setBalance(data.balance);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch balance");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onBuy = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tokens/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to init checkout");

      // Dynamically load Paddle.js and open checkout
      // @ts-ignore
      const Paddle = (window as any).Paddle;
      if (!Paddle) {
        const script = document.createElement("script");
        script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
        script.async = true;
        document.head.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }
      // @ts-ignore
      const PaddleLoaded = (window as any).Paddle;
      if (PaddleLoaded) {
        // @ts-ignore
        PaddleLoaded.Environment.set(data.environment);
        // @ts-ignore
        PaddleLoaded.Setup({ token: data.clientToken });
        // @ts-ignore
        PaddleLoaded.Checkout.open(data.checkout);
      } else {
        throw new Error("Paddle failed to load");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "px-3 py-1 rounded-full text-sm border",
          balance === null ? "text-muted-foreground border-border" : "text-foreground border-input"
        )}
      >
        {loading ? "Tokens..." : `Tokens: ${balance ?? "-"}`}
      </div>
      <Button size="sm" variant="outline" onClick={onBuy} disabled={loading}>
        Buy
      </Button>
    </div>
  );
}

