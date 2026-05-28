"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/DashboardNav";

const PRODUCT_TYPES = [
  "Paid Community",
  "Online Course",
  "Digital Downloads",
  "Coaching",
];

const ALLOWED_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "video/mp4",
  "image/png",
  "image/jpeg",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

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
    booking_url: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const selected = e.target.files?.[0] ?? null;
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError("Allowed types: PDF, ZIP, MP4, PNG, JPG.");
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError("File must be under 50 MB.");
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFileError(null);

    if (!form.name.trim()) {
      setError("Please enter a product name.");
      return;
    }
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price.");
      return;
    }
    if (form.product_type === "Digital Downloads" && !file) {
      setError("Please upload a file for your digital download product.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    // Upload file to Supabase Storage "downloads" bucket
    if (form.product_type === "Digital Downloads" && file) {
      setUploadProgress(true);
      const ext = file.name.split(".").pop();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${userId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("downloads")
        .upload(storagePath, file, { upsert: false });

      setUploadProgress(false);

      if (uploadError) {
        setError(`File upload failed: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }

      fileUrl = storagePath;
      fileName = file.name;
      void ext; // used in storagePath implicitly via safeName
    }

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
      file_url: fileUrl,
      file_name: fileName,
      booking_url:
        form.product_type === "Coaching"
          ? form.booking_url.trim() || null
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
  const showFileUpload = form.product_type === "Digital Downloads";
  const showBookingUrl = form.product_type === "Coaching";

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav handle={handle} creatorName={fullName} />

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

            {/* File upload — only for Digital Downloads */}
            {showFileUpload && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">
                  Download file
                </p>
                <div>
                  <label
                    htmlFor="file_upload"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Upload file{" "}
                    <span className="text-gray-400 font-normal">(max 50 MB)</span>
                  </label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-all ${
                      file
                        ? "border-violet-300 bg-violet-50"
                        : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      id="file_upload"
                      type="file"
                      accept=".pdf,.zip,.mp4,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(1)} MB — click to change
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-600 font-medium">
                          Click to upload
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF, ZIP, MP4, PNG, JPG — up to 50 MB
                        </p>
                      </>
                    )}
                  </div>

                  {fileError && (
                    <p className="text-xs text-red-500 mt-1.5">{fileError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Booking URL — only for Coaching */}
            {showBookingUrl && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">
                  Coaching setup
                </p>
                <div>
                  <label
                    htmlFor="booking_url"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Booking URL
                  </label>
                  <input
                    id="booking_url"
                    name="booking_url"
                    type="url"
                    placeholder="https://calendly.com/your-name"
                    value={form.booking_url}
                    onChange={handleChange}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Your Calendly, Cal.com, or any booking link. Shown to buyers after purchase.
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
                {uploadProgress
                  ? "Uploading file…"
                  : submitting
                  ? "Creating product…"
                  : "Create product"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
