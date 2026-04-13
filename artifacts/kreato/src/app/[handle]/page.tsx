import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const COUNTRY_FLAG: Record<string, string> = {
  Malaysia: "🇲🇾",
  Singapore: "🇸🇬",
  Philippines: "🇵🇭",
  Vietnam: "🇻🇳",
  Indonesia: "🇮🇩",
};

const TYPE_COLOR: Record<string, string> = {
  "Paid Community": "bg-violet-50 text-violet-600",
  "Online Course": "bg-blue-50 text-blue-600",
  "Digital Downloads": "bg-amber-50 text-amber-600",
  Coaching: "bg-emerald-50 text-emerald-600",
};

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  return {
    title: `@${handle} on Kreato`,
    description: `Support ${handle} on Kreato`,
  };
}

export default async function CreatorStorefront({ params }: Props) {
  const { handle } = await params;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Public page — no session cookies to set
        },
      },
    }
  );

  // Look up creator by handle
  const { data: creator } = await supabase
    .from("creators")
    .select("id, full_name, handle, country, product_type")
    .eq("handle", handle)
    .single();

  if (!creator) notFound();

  // Fetch their active products
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, product_type, price, billing_type")
    .eq("creator_id", creator.id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  const initials = creator.full_name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const flag = COUNTRY_FLAG[creator.country] ?? "🌏";
  const activeProducts = products ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">
              Kreato
            </span>
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 border border-violet-200 hover:border-violet-400 px-4 py-1.5 rounded-lg transition-colors"
          >
            Create your store →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Creator profile */}
        <div className="flex flex-col items-center text-center mb-16">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mb-5 shadow-lg shadow-violet-200">
            <span className="text-white font-bold text-2xl">{initials}</span>
          </div>

          {/* Name + handle */}
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {creator.full_name}
          </h1>
          <p className="text-violet-600 font-medium mb-3">
            @{creator.handle}
          </p>

          {/* Country */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="text-base">{flag}</span>
            <span>{creator.country}</span>
          </div>
        </div>

        {/* Products section */}
        {activeProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">
              No products yet. Check back soon.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-8">
              Products
            </h2>

            <div
              className={`grid gap-5 ${
                activeProducts.length === 1
                  ? "max-w-sm mx-auto"
                  : activeProducts.length === 2
                  ? "sm:grid-cols-2 max-w-2xl mx-auto"
                  : "sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {activeProducts.map((product) => {
                const isMonthly = product.billing_type === "monthly";
                const price = Number(product.price).toFixed(2);
                const typeClass =
                  TYPE_COLOR[product.product_type] ??
                  "bg-gray-100 text-gray-600";

                return (
                  <div
                    key={product.id}
                    className="group border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:shadow-gray-100 hover:border-gray-200 transition-all duration-200 bg-white"
                  >
                    {/* Type badge */}
                    <span
                      className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${typeClass}`}
                    >
                      {product.product_type}
                    </span>

                    {/* Name + description */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${price}
                        {isMonthly && (
                          <span className="text-base font-normal text-gray-400">
                            /mo
                          </span>
                        )}
                      </p>
                      {!isMonthly && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          one-time payment
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <button className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors group-hover:shadow-md group-hover:shadow-violet-200">
                      Join now
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Powered by{" "}
            <span className="font-semibold text-violet-600">Kreato</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
