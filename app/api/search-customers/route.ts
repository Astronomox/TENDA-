import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";

  if (!q) return NextResponse.json([]);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("Customers")
    .select("id, name")
    .ilike("name", `${q}%`)
    .limit(5);

  if (error) return NextResponse.json([]);

  return NextResponse.json(data);
}
