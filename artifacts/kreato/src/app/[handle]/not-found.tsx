import Link from "next/link";

export default function CreatorNotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">K</span>
        </div>
        <span className="font-bold text-gray-900 text-lg tracking-tight">
          Kreato
        </span>
      </Link>

      <p className="text-6xl font-bold text-gray-100 mb-4">404</p>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Creator not found
      </h1>
      <p className="text-sm text-gray-400 mb-8 text-center max-w-xs">
        This handle doesn&apos;t exist on Kreato yet. Want to claim it?
      </p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/signup"
          className="text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition-colors"
        >
          Create your store
        </Link>
      </div>
    </div>
  );
}
