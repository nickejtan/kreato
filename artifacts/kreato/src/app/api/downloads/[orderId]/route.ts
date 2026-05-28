import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type OrderRow = {
  id: string;
  product_id: string;
  status: string;
};

type ProductRow = {
  product_type: string;
  file_url: string | null;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  if (!orderId) {
    return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: order, error: orderError } = (await supabase
    .from("orders")
    .select("id, product_id, status")
    .eq("id", orderId)
    .single()) as unknown as { data: OrderRow | null; error: { message: string } | null };

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Order has not been paid" },
      { status: 403 }
    );
  }

  const { data: product, error: productError } = (await supabase
    .from("products")
    .select("product_type, file_url")
    .eq("id", order.product_id)
    .single()) as unknown as { data: ProductRow | null; error: { message: string } | null };

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.product_type !== "Digital Downloads" || !product.file_url) {
    return NextResponse.json(
      { error: "No downloadable file for this product" },
      { status: 400 }
    );
  }

  // Use service role key if available for private bucket access,
  // fall back to anon key (requires bucket policies to allow signed URL creation)
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const { data: signedData, error: signError } = await adminClient.storage
    .from("downloads")
    .createSignedUrl(product.file_url, 3600); // 1 hour

  if (signError || !signedData?.signedUrl) {
    console.error("[downloads] createSignedUrl error:", signError?.message);
    return NextResponse.json(
      { error: "Could not generate download link" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signedData.signedUrl);
}
