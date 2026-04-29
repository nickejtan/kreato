import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">K</span>
        </div>
        <span className="font-bold text-gray-900 text-lg tracking-tight">Kreato</span>
      </Link>

      <div className="text-5xl mb-6">🎉</div>
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
        You&apos;re on the list!
      </h1>
      <p className="text-lg text-gray-500 max-w-sm mb-4">
        We&apos;ll personally review your profile and reach out within 48 hours.
      </p>
      <p className="text-sm text-gray-400 max-w-sm mb-10">
        I&apos;ll be personally sliding into your DMs on Instagram — follow me at{" "}
        <a
          href="https://instagram.com/thenicketan"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
        >
          @thenicketan
        </a>{" "}
        so you don&apos;t miss it.
      </p>
      <Link
        href="/"
        className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
      >
        ← Back to homepage
      </Link>
    </div>
  );
}
