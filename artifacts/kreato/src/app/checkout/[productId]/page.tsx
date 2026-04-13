"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const COUNTRIES = [
  "Malaysia",
  "Singapore",
  "Philippines",
  "Vietnam",
  "Indonesia",
];

type ProductData = {
  id: string;
  name: string;
  description: string | null;
  product_type: string;
  price: number;
  billing_type: "one_time" | "monthly";
  creator: {
    id: string;
    full_name: string;
    handle: string;
  };
};

interface Props {
  params: Promise<{ productId: string }>;
}

export default function CheckoutPage({ params }: Props) {
  const [productId, setProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    buyer_name: "",
    buyer_email: "",
    buyer_country: "",
    buyer_telegram: "",
  });

  // Resolve async params
  useEffect(() => {
    params.then(({ productId }) => setProductId(productId));
  }, [params]);

  // Fetch product + creator once productId is resolved
  useEffect(() => {
    if (!productId) return;

    async function load() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select(
          `id, name, description, product_type, price, billing_type,
           creator:creators (id, full_name, handle)`
        )
        .eq("id", productId!)
        .eq("active", true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        // supabase returns creator as array for joins — unwrap
        const raw = data as unknown as {
          id: string;
          name: string;
          description: string | null;
          product_type: string;
          price: number;
          billing_type: "one_time" | "monthly";
          creator: { id: string; full_name: string; handle: string } | { id: string; full_name: string; handle: string }[];
        };
        const creator = Array.isArray(raw.creator) ? raw.creator[0] : raw.creator;
        setProduct({ ...raw, creator } as ProductData);
      }
      setLoading(false);
    }

    load();
  }, [productId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.buyer_name.trim()) return setError("Please enter your full name.");
    if (!form.buyer_email.trim()) return setError("Please enter your email.");
    if (!form.buyer_country) return setError("Please select your country.");
    if (!form.buyer_telegram.trim()) return setError("Please enter your Telegram username.");

    setSubmitting(true);
    const supabase = createClient();

    const cleanTelegram = form.buyer_telegram.trim().replace(/^@/, "");

    const { data: orderData, error: insertError } = await supabase
      .from("orders")
      .insert({
        product_id: product!.id,
        creator_id: product!.creator.id,
        buyer_name: form.buyer_name.trim(),
        buyer_email: form.buyer_email.trim().toLowerCase(),
        buyer_country: form.buyer_country,
        buyer_telegram: cleanTelegram,
        amount: product!.price,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !orderData) {
      setError(insertError?.message ?? "Failed to create order.");
      setSubmitting(false);
      return;
    }

    // Call the server route to create the Telegram invite link.
    // The bot token is fetched server-side and never sent to the browser.
    try {
      const res = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.id,
          productId: product!.id,
          buyerName: form.buyer_name.trim(),
          buyerTelegram: cleanTelegram,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setInviteLink(json.inviteLink ?? null);
      }
    } catch {
      // Non-fatal — order was saved, invite link just couldn't be generated
    }

    setSuccess(true);
  }

  // ── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl font-bold text-gray-100 mb-4">404</p>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          Product not found
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          This product may no longer be available.
        </p>
        <Link href="/" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
          Go home
        </Link>
      </div>
    );
  }

  const price = Number(product.price).toFixed(2);
  const isMonthly = product.billing_type === "monthly";

  // ── Success ──────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">K</span>
          </div>
          <span className="font-bold text-gray-900 tracking-tight">Kreato</span>
        </Link>

        {/* Check icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You&apos;re in! 🎉
        </h1>

        {inviteLink ? (
          <>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-5">
              Your one-time invite link is ready. Click it to join the group.
            </p>
            <a
              href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors mb-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Join the Telegram group
            </a>
            <p className="text-gray-400 text-xs max-w-xs mb-8">
              ⚠️ This link is valid for <strong>24 hours</strong> and can only be used once.
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-2">
              Your order is confirmed. The creator will send you a Telegram invite shortly.
            </p>
            <p className="text-gray-400 text-xs max-w-xs mb-8">
              Check your Telegram from{" "}
              <span className="font-medium text-gray-600">@{product.creator.handle}</span>.
            </p>
          </>
        )}

        <div className="border border-gray-100 rounded-2xl p-5 max-w-xs w-full text-left mb-8">
          <p className="text-xs text-gray-400 mb-1">Order summary</p>
          <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">by {product.creator.full_name}</p>
          <p className="font-bold text-gray-900 mt-3">
            ${price}
            {isMonthly && <span className="text-sm font-normal text-gray-400">/mo</span>}
          </p>
        </div>

        <Link
          href={`/${product.creator.handle}`}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to {product.creator.full_name}&apos;s store
        </Link>
      </div>
    );
  }

  // ── Checkout form ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">Kreato</span>
          </Link>
          <Link
            href={`/${product.creator.handle}`}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← {product.creator.full_name}&apos;s store
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* ── Left: Product summary ── */}
          <div className="md:col-span-2">
            <div className="card p-6 md:sticky md:top-24">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Order summary
              </p>

              {/* Creator */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {product.creator.full_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {product.creator.full_name}
                  </p>
                  <p className="text-xs text-violet-600">@{product.creator.handle}</p>
                </div>
              </div>

              {/* Product */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <p className="font-semibold text-gray-900 mb-1">{product.name}</p>
                {product.description && (
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${price}
                  {isMonthly && (
                    <span className="text-sm font-normal text-gray-400">/mo</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {isMonthly ? "Recurring monthly" : "One-time payment"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: Checkout form ── */}
          <div className="md:col-span-3">
            <div className="card p-8">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Complete your purchase
              </h1>
              <p className="text-sm text-gray-400 mb-7">
                Fill in your details to join {product.creator.full_name}&apos;s community.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    id="buyer_name"
                    name="buyer_name"
                    type="text"
                    placeholder="Your full name"
                    value={form.buyer_name}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="buyer_email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="buyer_email"
                    name="buyer_email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.buyer_email}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="buyer_country" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Country
                  </label>
                  <select
                    id="buyer_country"
                    name="buyer_country"
                    value={form.buyer_country}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="" disabled>Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="buyer_telegram" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Telegram username
                  </label>
                  <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent transition-all">
                    <span className="pl-3.5 pr-1 text-sm text-gray-400 select-none">@</span>
                    <input
                      id="buyer_telegram"
                      name="buyer_telegram"
                      type="text"
                      placeholder="yourusername"
                      value={form.buyer_telegram}
                      onChange={handleChange}
                      required
                      className="flex-1 py-2.5 pr-3.5 text-sm text-gray-900 bg-transparent outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    We&apos;ll use this to add you to the Telegram group.
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3 text-base mt-2"
                >
                  {submitting ? "Processing..." : `Complete purchase — $${price}${isMonthly ? "/mo" : ""}`}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  By completing this purchase you agree to the terms of service.
                  No payment is charged at this stage.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
