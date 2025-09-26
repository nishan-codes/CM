import { cookies } from "next/headers";
import { supabase } from "@/integrations/supabase/client";

export type TokenBalance = {
  uid: string;
  balance: number;
  updatedAt: number;
};

// Costs: per search term per result unit
export const TOKEN_COST_PER_RESULT = 1; // 1 token per returned item

export function getUidFromCookie(): string {
  const cookieStore = cookies();
  const uid = cookieStore.get("uid")?.value;
  if (!uid) {
    throw new Error("Missing uid cookie. Refresh the page to initialize session.");
  }
  return uid;
}

// Persist and read balances in Supabase table `token_balances` (uid text primary key, balance int)
export async function getBalance(uid: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("token_balances")
      .select("balance")
      .eq("uid", uid)
      .single();
    if (error) {
      if ((error as any).code === "PGRST116") return 0; // no rows
      console.warn("supabase getBalance error", error);
      return 0;
    }
    return data?.balance ?? 0;
  } catch (e) {
    console.warn("getBalance fallback to 0", e);
    return 0;
  }
}

export async function setBalance(uid: string, newBalance: number): Promise<void> {
  try {
    const { error } = await supabase
      .from("token_balances")
      .upsert({ uid, balance: Math.max(0, Math.floor(newBalance)) })
      .eq("uid", uid);
    if (error) throw error as any;
  } catch (e) {
    console.error("setBalance error", e);
    throw e;
  }
}

export async function addTokens(uid: string, amount: number): Promise<number> {
  const current = await getBalance(uid);
  const updated = current + Math.max(0, Math.floor(amount));
  await setBalance(uid, updated);
  return updated;
}

export async function consumeTokens(uid: string, amount: number): Promise<{ ok: boolean; balance: number }> {
  const current = await getBalance(uid);
  if (current < amount) {
    return { ok: false, balance: current };
  }
  const updated = current - amount;
  await setBalance(uid, updated);
  return { ok: true, balance: updated };
}

export function calculateSearchCost(terms: string[], resultsPerTerm: number): number {
  const expectedResults = terms.length * resultsPerTerm;
  return expectedResults * TOKEN_COST_PER_RESULT;
}

