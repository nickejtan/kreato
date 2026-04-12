import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            Kreato
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary text-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          Now available across Southeast Asia
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight max-w-3xl mb-6">
          Where SEA creators{" "}
          <span className="text-violet-600">get paid</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
          Kreato is the monetization platform built for Southeast Asian creators.
          Grow your audience, launch memberships, and earn in your local currency.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/signup" className="btn-primary px-7 py-3 text-base">
            Start for free
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Already have an account? Log in →
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-10 mt-20 pt-10 border-t border-gray-100 w-full max-w-2xl">
          {[
            { value: "10K+", label: "Active creators" },
            { value: "6", label: "SEA markets" },
            { value: "$2M+", label: "Paid out" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>© 2024 Kreato. Built for SEA.</span>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
