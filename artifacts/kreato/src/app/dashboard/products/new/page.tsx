"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/DashboardNav";

const PRODUCT_TYPES = [
  "Paid Community",
  "Online Course",
  "Digital Downloads",
  "Coaching",
];

export default function NewProductPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    product_type: "Paid Community",
    price: "",
    billing_type: "one_time",
    telegram_link: "",
    telegram_bot_token: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data: creator } = await supabase
        .from("creators")
        .select("product_type, handle, full_name")
        .eq("id", session.user.id)
        .single();

      setUserId(session.user.id);
      setHandle(creator?.handle ?? "");
      setFullName(creator?.full_name ?? "");
      setForm((prev) => ({
        ...prev,
        product_type: creator?.product_type ?? "Paid Community",
      }));
      setLoading(false);
    }

    load();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Please enter a product name.");
      return;
    }
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("products").insert({
      creator_id: userId!,
      name: form.name.trim(),
      description: form.description.trim() || null,
      product_type: form.product_type,
      price: priceNum,
      billing_type: form.billing_type as "one_time" | "monthly",
      telegram_link:
        form.product_type === "Paid Community"
          ? form.telegram_link.trim() || null
          : null,
      telegram_bot_token:
        form.product_type === "Paid Community"
          ? form.telegram_bot_token.trim() || null
          : null,
      active: true,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    if (form.product_type === "Online Course") {
      const { data: newProduct } = await supabase
        .from("products")
        .select("id")
        .eq("creator_id", userId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (newProduct) {
        window.location.href = `/dashboard/products/${newProduct.id}/course`;
        return;
      }
    }

    window.location.href = "/dashboard";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const showTelegram = form.product_type === "Paid Community";

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav handle={handle} creatorName={fullName} />

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create a product
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Set up your product and start earning.
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Product name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder={`e.g. "Nick's Crypto Signals"`}
                value={form.name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Description{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="What do members get? What's included?"
                value={form.description}
                onChange={handleChange}
                className="input-field resize-none"
              />
            </div>

            {/* Product type */}
            <div>
              <label
                htmlFor="product_type"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Product type
              </label>
              <select
                id="product_type"
                name="product_type"
                value={form.product_type}
                onChange={handleChange}
                className="input-field"
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Price + Billing row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Price (USD)
                </label>
                <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent transition-all">
                  <span className="pl-3.5 pr-1 text-sm text-gray-400 select-none">
                    $
                  </span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="flex-1 py-2.5 pr-3.5 text-sm text-gray-900 bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-1.5">
                  Billing
                </p>
                <div className="flex gap-3 h-[42px] items-center">
                  {[
                    { value: "one_time", label: "One-time" },
                    { value: "monthly", label: "Monthly" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm cursor-pointer transition-all ${
                        form.billing_type === opt.value
                          ? "border-violet-500 bg-violet-50 text-violet-700 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="billing_type"
                        value={opt.value}
                        checked={form.billing_type === opt.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Telegram fields — only for Paid Community */}
            {showTelegram && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">
                  Telegram setup
                </p>

                <div>
                  <label
                    htmlFor="telegram_link"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Telegram group link
                  </label>
                  <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent transition-all">
                    <span className="pl-3.5 pr-1 text-sm text-gray-400 select-none whitespace-nowrap">
                      t.me/
                    </span>
                    <input
                      id="telegram_link"
                      name="telegram_link"
                      type="text"
                      placeholder="groupname"
                      value={form.telegram_link}
                      onChange={handleChange}
                      className="flex-1 py-2.5 pr-3.5 text-sm text-gray-900 bg-transparent outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Make your bot an admin of this group first.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="telegram_bot_token"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Telegram bot token
                  </label>
                  <input
                    id="telegram_bot_token"
                    name="telegram_bot_token"
                    type="text"
                    placeholder="123456789:ABCdef..."
                    value={form.telegram_bot_token}
                    onChange={handleChange}
                    className="input-field font-mono text-xs"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Get yours from{" "}
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-500 hover:text-violet-600"
                    >
                      @BotFather
                    </a>{" "}
                    on Telegram.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium text-center hover:border-gray-300 hover:text-gray-900 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-[2] py-2.5"
              >
                {submitting ? "Creating product..." : "Create product"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
