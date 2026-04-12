"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COUNTRIES = [
  "Malaysia",
  "Singapore",
  "Philippines",
  "Vietnam",
  "Indonesia",
];

const PRODUCT_TYPES = [
  "Paid Community",
  "Online Course",
  "Digital Downloads",
  "Coaching",
];

interface Props {
  userId: string;
  defaultName: string;
}

export default function OnboardingForm({ userId, defaultName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: defaultName,
    handle: "",
    country: "",
    product_type: "",
    fdusd_wallet: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    if (name === "handle") {
      setForm((prev) => ({
        ...prev,
        handle: value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.handle.trim()) {
      setError("Please choose a creator handle.");
      return;
    }
    if (!form.country) {
      setError("Please select your country.");
      return;
    }
    if (!form.product_type) {
      setError("Please select what you sell.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("creators").insert({
      id: userId,
      full_name: form.full_name.trim(),
      handle: form.handle.trim(),
      country: form.country,
      product_type: form.product_type,
      fdusd_wallet: form.fdusd_wallet.trim() || null,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        setError(
          "That handle is already taken. Please choose a different one."
        );
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="Your full name"
          value={form.full_name}
          onChange={handleChange}
          required
          className="input-field"
        />
      </div>

      {/* Handle */}
      <div>
        <label
          htmlFor="handle"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Creator handle
        </label>
        <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent transition-all">
          <span className="pl-3.5 pr-1 text-sm text-gray-400 select-none whitespace-nowrap">
            getkreato.com/@
          </span>
          <input
            id="handle"
            name="handle"
            type="text"
            placeholder="yourhandle"
            value={form.handle}
            onChange={handleChange}
            required
            className="flex-1 py-2.5 pr-3.5 text-sm text-gray-900 bg-transparent outline-none"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Letters, numbers, and underscores only
        </p>
      </div>

      {/* Country */}
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Country
        </label>
        <select
          id="country"
          name="country"
          value={form.country}
          onChange={handleChange}
          required
          className="input-field"
        >
          <option value="" disabled>
            Select your country
          </option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Product type */}
      <div>
        <label
          htmlFor="product_type"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          What do you sell?
        </label>
        <select
          id="product_type"
          name="product_type"
          value={form.product_type}
          onChange={handleChange}
          required
          className="input-field"
        >
          <option value="" disabled>
            Select a category
          </option>
          {PRODUCT_TYPES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* FDUSD wallet */}
      <div>
        <label
          htmlFor="fdusd_wallet"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          FDUSD payout wallet{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="fdusd_wallet"
          name="fdusd_wallet"
          type="text"
          placeholder="0x..."
          value={form.fdusd_wallet}
          onChange={handleChange}
          className="input-field"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Your FDUSD payout wallet — get one free at{" "}
          <a
            href="https://firstdigital.finance"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:text-violet-600"
          >
            firstdigital.finance
          </a>
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 mt-2"
      >
        {loading ? "Setting up your account..." : "Complete setup"}
      </button>
    </form>
  );
}
