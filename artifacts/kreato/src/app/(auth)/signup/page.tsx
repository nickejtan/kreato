"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Kreato
            </span>
          </Link>
          <div className="card p-8 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Check your email
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              We sent a confirmation link to{" "}
              <span className="font-medium text-gray-700">{email}</span>. Click
              it to activate your account.
            </p>
            <Link href="/login" className="btn-secondary w-full justify-center">
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            Kreato
          </span>
        </Link>

        {/* Card */}
        <div className="card p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Join thousands of SEA creators earning on Kreato
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="input-field"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-5">
            By signing up, you agree to our{" "}
            <Link href="#" className="text-gray-600 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-gray-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
