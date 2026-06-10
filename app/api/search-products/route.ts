import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only key
);


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");


  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }


  const { data, error } = await supabase
    .from("products")
    .select("id, product_name, price")
    .ilike("product_name", `%${query}%`)
    .limit(5);


  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }


  return NextResponse.json(data);
}
