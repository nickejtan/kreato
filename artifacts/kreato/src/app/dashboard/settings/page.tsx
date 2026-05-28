"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/DashboardNav";

const SOCIAL_FIELDS = [
  {
    key: "instagram" as const,
    label: "Instagram",
    placeholder: "yourcreatorname",
    prefix: "@",
    color: "text-pink-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    key: "twitter" as const,
    label: "Twitter / X",
    placeholder: "yourhandle",
    prefix: "@",
    color: "text-sky-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.264 5.638 5.9-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "tiktok" as const,
    label: "TikTok",
    placeholder: "yourhandle",
    prefix: "@",
    color: "text-gray-900",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
  {
    key: "youtube" as const,
    label: "YouTube",
    placeholder: "yourchannel",
    prefix: "@",
    color: "text-red-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

type SocialKey = "instagram" | "twitter" | "tiktok" | "youtube";

interface CreatorData {
  handle: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [form, setForm] = useState<CreatorData>({
    handle: "",
    full_name: "",
    bio: "",
    avatar_url: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    youtube: "",
  });
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

      setUserId(session.user.id);

      const { data: creator } = await supabase
        .from("creators")
        .select(
          "handle, full_name, bio, avatar_url, instagram, twitter, tiktok, youtube"
        )
        .eq("id", session.user.id)
        .single();

      if (!creator) {
        window.location.href = "/onboarding";
        return;
      }

      setForm({
        handle: creator.handle ?? "",
        full_name: creator.full_name ?? "",
        bio: creator.bio ?? "",
        avatar_url: creator.avatar_url ?? "",
        instagram: creator.instagram ?? "",
        twitter: creator.twitter ?? "",
        tiktok: creator.tiktok ?? "",
        youtube: creator.youtube ?? "",
      });
      setLoading(false);
    }

    load();
  }, []);

  function setField(key: keyof CreatorData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5 MB.");
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setForm((prev) => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload photo."
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase
        .from("creators")
        .update({
          full_name: form.full_name.trim(),
          bio: form.bio.trim() || null,
          avatar_url: form.avatar_url || null,
          instagram: form.instagram.trim().replace(/^@/, "") || null,
          twitter: form.twitter.trim().replace(/^@/, "") || null,
          tiktok: form.tiktok.trim().replace(/^@/, "") || null,
          youtube: form.youtube.trim().replace(/^@/, "") || null,
        } as never)
        .eq("id", userId);

      if (updateErr) throw updateErr;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  const initials = form.full_name
    ? form.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav handle={form.handle} creatorName={form.full_name} />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage your public profile.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile photo */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Profile photo
            </h2>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 group focus:outline-none"
                disabled={uploadingAvatar}
              >
                {form.avatar_url ? (
                  <img
                    src={form.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {initials}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingAvatar ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </div>
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? "Uploading…" : "Change photo"}
                </button>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG or WebP. Max 5 MB.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Basic info */}
          <div className="card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Basic info
            </h2>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
                placeholder="Your name"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Handle
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-400">
                <span>kreato.com/</span>
                <span className="font-medium text-gray-700">{form.handle}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Handle cannot be changed after signup.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                placeholder="Tell your audience who you are and what you create…"
                rows={4}
                maxLength={300}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-500 transition-colors resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {form.bio.length}/300
              </p>
            </div>
          </div>

          {/* Social links */}
          <div className="card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Social links
            </h2>
            <p className="text-xs text-gray-400 -mt-2">
              Links appear on your public storefront. Leave blank to hide.
            </p>

            {SOCIAL_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  <span className={field.color}>{field.icon}</span>
                  {field.label}
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg focus-within:border-violet-500 transition-colors overflow-hidden">
                  <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">
                    {field.prefix}
                  </span>
                  <input
                    type="text"
                    value={form[field.key as SocialKey]}
                    onChange={(e) =>
                      setField(
                        field.key as keyof CreatorData,
                        e.target.value.replace(/^@/, "")
                      )
                    }
                    placeholder={field.placeholder}
                    className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Error / save feedback */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {saved && (
            <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
              Changes saved successfully.
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <a
              href={`/${form.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-violet-600 hover:text-violet-700 transition-colors"
            >
              View public page →
            </a>
            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
