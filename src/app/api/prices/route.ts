import { NextResponse } from "next/server";
import { getRates } from "@/lib/rates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rates = await getRates();
    return NextResponse.json(rates, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=15, must-revalidate" },
    });
  } catch {
    return NextResponse.json(
      { error: "Live prices are unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
