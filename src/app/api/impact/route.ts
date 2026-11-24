import { NextResponse } from "next/server";
import { getImpact } from "@/lib/impact";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getImpact(), {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60, must-revalidate" },
    });
  } catch {
    return NextResponse.json(
      { error: "Impact totals are unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
