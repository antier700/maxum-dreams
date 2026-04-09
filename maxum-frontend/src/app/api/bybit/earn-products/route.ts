import { NextResponse } from "next/server";
import { fetchAllEarnProducts } from "@/lib/bybit/fetchEarnProducts";

export async function GET() {
  try {
    const list = await fetchAllEarnProducts();
    return NextResponse.json({
      list,
      updatedAt: Date.now(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
