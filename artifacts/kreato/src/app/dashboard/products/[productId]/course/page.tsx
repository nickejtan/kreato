"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/DashboardNav";

type Lesson = {
  id: string;
  section_id: string;
  product_id: string;
  title: string;
  content: string;
  video_url: string;
  position: number;
};

type Section = {
  id: string;
  product_id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

type LessonDraft = {
  title: string;
  content: string;
  video_url: string;
};

const emptyDraft = (): LessonDraft => ({ title: "", content: "", video_url: "" });

export default function CourseBuilderPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);

  const [handle, setHandle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [productName, setProductName] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [savingSection, setSavingSection] = useState(false);

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  const [addingLessonInSection, setAddingLessonInSection] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState<LessonDraft>(emptyDraft());
  const [savingLesson, setSavingLesson] = useState(false);

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonDraft>(emptyDraft());
  const [savingEditLesson, setSavingEditLesson] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    setUserId(session.user.id);

    const [{ data: creator }, { data: product }, { data: rawSections }, { data: lessons }] =
      await Promise.all([
        supabase
          .from("creators")
          .select("full_name, handle")
          .eq("id", session.user.id)
          .single(),
        supabase
          .from("products")
          .select("name, product_type, creator_id")
          .eq("id", productId)
          .single(),
        supabase
          .from("course_sections")
          .select("id, product_id, title, position")
          .eq("product_id", productId)
          .order("position", { ascending: true }),
        supabase
          .from("course_lessons")
          .select("id, section_id, product_id, title, content, video_url, position")
          .eq("product_id", productId)
          .order("position", { ascending: true }),
      ]);

    if (!product || product.creator_id !== session.user.id) {
      window.location.href = "/dashboard";
      return;
    }

    setHandle(creator?.handle ?? "");
    setCreatorName(creator?.full_name ?? "");
    setProductName(product.name);

    const builtSections: Section[] = (rawSections ?? []).map((s) => ({
      ...s,
      lessons: (lessons ?? [])
        .filter((l) => l.section_id === s.id)
        .map((l) => ({
          ...l,
          content: l.content ?? "",
          video_url: l.video_url ?? "",
        })),
    }));

    setSections(builtSections);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addSection() {
    if (!newSectionTitle.trim()) return;
    setSavingSection(true);
    setError(null);
    const supabase = createClient();
    const nextPos = sections.length;
    const { data, error: err } = await supabase
      .from("course_sections")
      .insert({ product_id: productId, title: newSectionTitle.trim(), position: nextPos })
      .select()
      .single();
    if (err || !data) {
      setError(err?.message ?? "Failed to add section");
      setSavingSection(false);
      return;
    }
    setSections((prev) => [...prev, { ...data, lessons: [] }]);
    setNewSectionTitle("");
    setAddingSection(false);
    setSavingSection(false);
  }

  async function saveSection(sectionId: string) {
    if (!editingSectionTitle.trim()) return;
    setSavingSection(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("course_sections")
      .update({ title: editingSectionTitle.trim() })
      .eq("id", sectionId);
    if (err) {
      setError(err.message);
      setSavingSection(false);
      return;
    }
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title: editingSectionTitle.trim() } : s))
    );
    setEditingSectionId(null);
    setSavingSection(false);
  }

  async function deleteSection(sectionId: string) {
    if (!confirm("Delete this section and all its lessons?")) return;
    const supabase = createClient();
    await supabase.from("course_lessons").delete().eq("section_id", sectionId);
    await supabase.from("course_sections").delete().eq("id", sectionId);
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }

  async function moveSectionUp(idx: number) {
    if (idx === 0) return;
    const supabase = createClient();
    const a = sections[idx];
    const b = sections[idx - 1];
    await Promise.all([
      supabase.from("course_sections").update({ position: b.position }).eq("id", a.id),
      supabase.from("course_sections").update({ position: a.position }).eq("id", b.id),
    ]);
    setSections((prev) => {
      const next = [...prev];
      next[idx] = { ...a, position: b.position };
      next[idx - 1] = { ...b, position: a.position };
      return [next[idx - 1], ...next.slice(0, idx - 1), next[idx], ...next.slice(idx + 1)];
    });
  }

  async function moveSectionDown(idx: number) {
    if (idx === sections.length - 1) return;
    const supabase = createClient();
    const a = sections[idx];
    const b = sections[idx + 1];
    await Promise.all([
      supabase.from("course_sections").update({ position: b.position }).eq("id", a.id),
      supabase.from("course_sections").update({ position: a.position }).eq("id", b.id),
    ]);
    setSections((prev) => {
      const next = [...prev];
      next[idx] = { ...a, position: b.position };
      next[idx + 1] = { ...b, position: a.position };
      return [...next.slice(0, idx), next[idx + 1], next[idx], ...next.slice(idx + 2)];
    });
  }

  async function addLesson(sectionId: string) {
    if (!newLesson.title.trim()) return;
    setSavingLesson(true);
    setError(null);
    const supabase = createClient();
    const section = sections.find((s) => s.id === sectionId);
    const nextPos = section?.lessons.length ?? 0;
    const { data, error: err } = await supabase
      .from("course_lessons")
      .insert({
        section_id: sectionId,
        product_id: productId,
        title: newLesson.title.trim(),
        content: newLesson.content.trim() || null,
        video_url: newLesson.video_url.trim() || null,
        position: nextPos,
      })
      .select()
      .single();
    if (err || !data) {
      setError(err?.message ?? "Failed to add lesson");
      setSavingLesson(false);
      return;
    }
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: [
                ...s.lessons,
                {
                  ...data,
                  content: data.content ?? "",
                  video_url: data.video_url ?? "",
                },
              ],
            }
          : s
      )
    );
    setNewLesson(emptyDraft());
    setAddingLessonInSection(null);
    setSavingLesson(false);
  }

  async function saveLesson(sectionId: string, lessonId: string) {
    if (!editingLesson.title.trim()) return;
    setSavingEditLesson(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("course_lessons")
      .update({
        title: editingLesson.title.trim(),
        content: editingLesson.content.trim() || null,
        video_url: editingLesson.video_url.trim() || null,
      })
      .eq("id", lessonId);
    if (err) {
      setError(err.message);
      setSavingEditLesson(false);
      return;
    }
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      title: editingLesson.title.trim(),
                      content: editingLesson.content.trim(),
                      video_url: editingLesson.video_url.trim(),
                    }
                  : l
              ),
            }
          : s
      )
    );
    setEditingLessonId(null);
    setSavingEditLesson(false);
  }

  async function deleteLesson(sectionId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    const supabase = createClient();
    await supabase.from("course_lessons").delete().eq("id", lessonId);
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
      )
    );
  }

  async function moveLessonUp(sectionId: string, lessonIdx: number) {
    if (lessonIdx === 0) return;
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const supabase = createClient();
    const a = section.lessons[lessonIdx];
    const b = section.lessons[lessonIdx - 1];
    await Promise.all([
      supabase.from("course_lessons").update({ position: b.position }).eq("id", a.id),
      supabase.from("course_lessons").update({ position: a.position }).eq("id", b.id),
    ]);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const next = [...s.lessons];
        next[lessonIdx] = { ...a, position: b.position };
        next[lessonIdx - 1] = { ...b, position: a.position };
        return {
          ...s,
          lessons: [
            ...next.slice(0, lessonIdx - 1),
            next[lessonIdx - 1],
            next[lessonIdx],
            ...next.slice(lessonIdx + 1),
          ],
        };
      })
    );
  }

  async function moveLessonDown(sectionId: string, lessonIdx: number) {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || lessonIdx === section.lessons.length - 1) return;
    const supabase = createClient();
    const a = section.lessons[lessonIdx];
    const b = section.lessons[lessonIdx + 1];
    await Promise.all([
      supabase.from("course_lessons").update({ position: b.position }).eq("id", a.id),
      supabase.from("course_lessons").update({ position: a.position }).eq("id", b.id),
    ]);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const next = [...s.lessons];
        next[lessonIdx] = { ...a, position: b.position };
        next[lessonIdx + 1] = { ...b, position: a.position };
        return {
          ...s,
          lessons: [
            ...next.slice(0, lessonIdx),
            next[lessonIdx + 1],
            next[lessonIdx],
            ...next.slice(lessonIdx + 2),
          ],
        };
      })
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav handle={handle} creatorName={creatorName} />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{productName}</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Course builder ·{" "}
            {sections.length === 0
              ? "No sections yet"
              : `${sections.length} section${sections.length !== 1 ? "s" : ""}, ${totalLessons} lesson${totalLessons !== 1 ? "s" : ""}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-100 px-3.5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, sIdx) => (
            <div key={section.id} className="card overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="flex-1 min-w-0">
                  {editingSectionId === section.id ? (
                    <input
                      type="text"
                      value={editingSectionTitle}
                      onChange={(e) => setEditingSectionTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveSection(section.id);
                        if (e.key === "Escape") setEditingSectionId(null);
                      }}
                      autoFocus
                      className="input-field text-sm font-semibold py-1.5"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingSectionId(section.id);
                        setEditingSectionTitle(section.title);
                      }}
                      className="text-sm font-semibold text-gray-900 hover:text-violet-600 transition-colors text-left truncate max-w-full"
                    >
                      Section {sIdx + 1}: {section.title}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {editingSectionId === section.id ? (
                    <>
                      <button
                        onClick={() => saveSection(section.id)}
                        disabled={savingSection}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSectionId(null)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => moveSectionUp(sIdx)}
                        disabled={sIdx === 0}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        title="Move up"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveSectionDown(sIdx)}
                        disabled={sIdx === sections.length - 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        title="Move down"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete section"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-gray-100">
                {section.lessons.map((lesson, lIdx) => (
                  <div key={lesson.id} className="px-5 py-4">
                    {editingLessonId === lesson.id ? (
                      /* Editing form */
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Editing lesson {lIdx + 1}
                          </span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={editingLesson.title}
                            onChange={(e) => setEditingLesson((p) => ({ ...p, title: e.target.value }))}
                            className="input-field"
                            placeholder="Lesson title"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                          <textarea
                            value={editingLesson.content}
                            onChange={(e) => setEditingLesson((p) => ({ ...p, content: e.target.value }))}
                            rows={4}
                            className="input-field resize-none"
                            placeholder="Lesson content, notes, or instructions…"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Video URL{" "}
                            <span className="text-gray-400 font-normal">(YouTube or Loom, optional)</span>
                          </label>
                          <input
                            type="url"
                            value={editingLesson.video_url}
                            onChange={(e) => setEditingLesson((p) => ({ ...p, video_url: e.target.value }))}
                            className="input-field"
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => saveLesson(section.id, lesson.id)}
                            disabled={savingEditLesson}
                            className="btn-primary text-xs px-3 py-2"
                          >
                            {savingEditLesson ? "Saving…" : "Save lesson"}
                          </button>
                          <button
                            onClick={() => setEditingLessonId(null)}
                            className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Lesson row */
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 mt-0.5 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-violet-600">{lIdx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{lesson.title}</p>
                          {lesson.content && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{lesson.content}</p>
                          )}
                          {lesson.video_url && (
                            <p className="text-xs text-violet-500 mt-0.5 truncate">{lesson.video_url}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => moveLessonUp(section.id, lIdx)}
                            disabled={lIdx === 0}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                            title="Move up"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveLessonDown(section.id, lIdx)}
                            disabled={lIdx === section.lessons.length - 1}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                            title="Move down"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setEditingLessonId(lesson.id);
                              setEditingLesson({
                                title: lesson.title,
                                content: lesson.content,
                                video_url: lesson.video_url,
                              });
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            title="Edit lesson"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteLesson(section.id, lesson.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete lesson"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add lesson form */}
                {addingLessonInSection === section.id ? (
                  <div className="px-5 py-4 bg-violet-50/40 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New lesson</p>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                      <input
                        type="text"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson((p) => ({ ...p, title: e.target.value }))}
                        autoFocus
                        className="input-field"
                        placeholder="e.g. Introduction to the topic"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                      <textarea
                        value={newLesson.content}
                        onChange={(e) => setNewLesson((p) => ({ ...p, content: e.target.value }))}
                        rows={3}
                        className="input-field resize-none"
                        placeholder="Lesson content, notes, or instructions…"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Video URL{" "}
                        <span className="text-gray-400 font-normal">(YouTube or Loom, optional)</span>
                      </label>
                      <input
                        type="url"
                        value={newLesson.video_url}
                        onChange={(e) => setNewLesson((p) => ({ ...p, video_url: e.target.value }))}
                        className="input-field"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addLesson(section.id)}
                        disabled={savingLesson || !newLesson.title.trim()}
                        className="btn-primary text-xs px-3 py-2"
                      >
                        {savingLesson ? "Adding…" : "Add lesson"}
                      </button>
                      <button
                        onClick={() => {
                          setAddingLessonInSection(null);
                          setNewLesson(emptyDraft());
                        }}
                        className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-3">
                    <button
                      onClick={() => {
                        setAddingLessonInSection(section.id);
                        setNewLesson(emptyDraft());
                      }}
                      className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add lesson
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add section */}
        <div className="mt-4">
          {addingSection ? (
            <div className="card p-5 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New section</p>
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSection();
                  if (e.key === "Escape") {
                    setAddingSection(false);
                    setNewSectionTitle("");
                  }
                }}
                autoFocus
                placeholder="e.g. Module 1: Getting Started"
                className="input-field"
              />
              <div className="flex gap-2">
                <button
                  onClick={addSection}
                  disabled={savingSection || !newSectionTitle.trim()}
                  className="btn-primary text-sm px-4 py-2"
                >
                  {savingSection ? "Adding…" : "Add section"}
                </button>
                <button
                  onClick={() => {
                    setAddingSection(false);
                    setNewSectionTitle("");
                  }}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingSection(true)}
              className="w-full card p-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-violet-600 hover:border-violet-200 hover:shadow-none transition-all border-dashed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add section
            </button>
          )}
        </div>

        {sections.length === 0 && !addingSection && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Start building your course by adding a section above.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
