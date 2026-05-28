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

interface SocialLink {
  key: string;
  handle: string | null;
  href: (h: string) => string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.264 5.638 5.9-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

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
        setAll() {},
      },
    }
  );

  const { data: creator } = await supabase
    .from("creators")
    .select(
      "id, full_name, handle, country, product_type, bio, avatar_url, instagram, twitter, tiktok, youtube"
    )
    .eq("handle", handle)
    .single();

  if (!creator) notFound();

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

  const socialLinks: SocialLink[] = [
    {
      key: "instagram",
      handle: creator.instagram,
      href: (h: string) => `https://instagram.com/${h}`,
      label: "Instagram",
      icon: <InstagramIcon />,
      color: "text-pink-500 hover:text-pink-600",
    },
    {
      key: "twitter",
      handle: creator.twitter,
      href: (h: string) => `https://x.com/${h}`,
      label: "Twitter / X",
      icon: <TwitterIcon />,
      color: "text-sky-500 hover:text-sky-600",
    },
    {
      key: "tiktok",
      handle: creator.tiktok,
      href: (h: string) => `https://tiktok.com/@${h}`,
      label: "TikTok",
      icon: <TikTokIcon />,
      color: "text-gray-800 hover:text-gray-900",
    },
    {
      key: "youtube",
      handle: creator.youtube,
      href: (h: string) => `https://youtube.com/@${h}`,
      label: "YouTube",
      icon: <YouTubeIcon />,
      color: "text-red-500 hover:text-red-600",
    },
  ].filter((s) => s.handle);

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
          <div className="w-24 h-24 rounded-2xl overflow-hidden mb-5 shadow-lg shadow-violet-100 flex-shrink-0">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">{initials}</span>
              </div>
            )}
          </div>

          {/* Name + handle */}
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {creator.full_name}
          </h1>
          <p className="text-violet-600 font-medium mb-3">
            @{creator.handle}
          </p>

          {/* Bio */}
          {creator.bio && (
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mb-4">
              {creator.bio}
            </p>
          )}

          {/* Country */}
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
            <span className="text-base">{flag}</span>
            <span>{creator.country}</span>
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.key}
                  href={social.href(social.handle!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={`@${social.handle} on ${social.label}`}
                  className={`transition-colors ${social.color}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}
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
                    <span
                      className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${typeClass}`}
                    >
                      {product.product_type}
                    </span>

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

                    <Link
                      href={`/checkout/${product.id}`}
                      className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors group-hover:shadow-md group-hover:shadow-violet-200 text-center block"
                    >
                      Join now
                    </Link>
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
