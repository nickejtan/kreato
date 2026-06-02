"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
};

type FormState = {
  clientName: string;
  clientEmail: string;
  projectName: string;
  amount: string;
  description: string;
  depositRequired: boolean;
  depositPercentage: string;
  isRecurring: boolean;
  billingCycle: string;
  dueDate: string;
};

const INITIAL_FORM: FormState = {
  clientName: "",
  clientEmail: "",
  projectName: "",
  amount: "",
  description: "",
  depositRequired: false,
  depositPercentage: "50",
  isRecurring: false,
  billingCycle: "monthly",
  dueDate: "",
};

export default function CreatePaymentLinkModal({ isOpen, onClose, userId }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  function set(field: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  function handleClose() {
    setForm(INITIAL_FORM);
    setError(null);
    setGeneratedLink(null);
    setCopied(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const depositPct = form.depositRequired ? parseInt(form.depositPercentage, 10) : null;
    if (form.depositRequired && (isNaN(depositPct!) || depositPct! < 1 || depositPct! > 99)) {
      setError("Deposit percentage must be between 1 and 99.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from("payment_links")
        .insert({
          client_name: form.clientName.trim(),
          client_email: form.clientEmail.trim().toLowerCase(),
          project_name: form.projectName.trim(),
          amount: amountNum,
          description: form.description.trim() || null,
          deposit_percentage: depositPct,
          is_recurring: form.isRecurring,
          billing_cycle: form.isRecurring ? form.billingCycle : null,
          due_date: form.dueDate,
          status: "pending",
          created_by: userId,
        })
        .select("id")
        .single();

      if (dbError) throw dbError;

      const link = `https://getkreato.com/pay/${data.id}`;
      setGeneratedLink(link);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create payment link</h2>
            <p className="text-sm text-gray-500 mt-0.5">Share a link with your client to collect payment.</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {generatedLink ? (
          /* ── Success state ── */
          <div className="px-6 py-8 text-center space-y-5">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Payment link created!</p>
              <p className="text-sm text-gray-500 mt-1">Share this link with your client via WhatsApp or email.</p>
            </div>

            {/* Link box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left">
              <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">Your payment link</p>
              <p className="text-sm text-gray-800 font-mono break-all">{generatedLink}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy link
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                className="w-full px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Client name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Client name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.clientName}
                onChange={(e) => set("clientName", e.target.value)}
                placeholder="Ahmad bin Razak"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            {/* Client email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Client email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={form.clientEmail}
                onChange={(e) => set("clientEmail", e.target.value)}
                placeholder="ahmad@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            {/* Project name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.projectName}
                onChange={(e) => set("projectName", e.target.value)}
                placeholder="e.g. Website Redesign, Social Media Management"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount (RM) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">RM</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief description of the work"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Deposit toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Deposit required?</p>
                  <p className="text-xs text-gray-400 mt-0.5">Client pays a partial deposit upfront</p>
                </div>
                <button
                  type="button"
                  onClick={() => set("depositRequired", !form.depositRequired)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                    form.depositRequired ? "bg-violet-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.depositRequired ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {form.depositRequired && (
                <div className="flex items-center gap-3 bg-violet-50 rounded-xl px-4 py-3">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Deposit percentage</label>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={form.depositPercentage}
                      onChange={(e) => set("depositPercentage", e.target.value)}
                      className="w-full pr-8 pl-3.5 py-2 rounded-lg border border-violet-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                  </div>
                  {form.amount && (
                    <p className="text-sm text-violet-700 font-medium whitespace-nowrap">
                      = RM {((parseFloat(form.amount) || 0) * (parseInt(form.depositPercentage, 10) || 0) / 100).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Recurring payment toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Recurring payment?</p>
                  <p className="text-xs text-gray-400 mt-0.5">This is a monthly retainer or recurring charge</p>
                </div>
                <button
                  type="button"
                  onClick={() => set("isRecurring", !form.isRecurring)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                    form.isRecurring ? "bg-violet-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.isRecurring ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {form.isRecurring && (
                <div className="bg-violet-50 rounded-xl px-4 py-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Billing cycle</label>
                  <select
                    value={form.billingCycle}
                    onChange={(e) => set("billingCycle", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-violet-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Due date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Due date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={form.dueDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => set("dueDate", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 pb-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-5 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create payment link"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
