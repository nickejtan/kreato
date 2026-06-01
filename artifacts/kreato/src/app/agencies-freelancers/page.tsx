import Link from "next/link";

const PAYMENT_METHODS = [
  "FPX",
  "DuitNow",
  "Touch 'n Go",
  "GrabPay",
  "Visa",
  "Mastercard",
  "Boost",
  "ShopeePay",
];

const PAIN_POINTS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Chasing payments over WhatsApp",
    description:
      "You send your bank account number in a chat and then wait. No confirmation, no invoice, no record.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Invoices that look unprofessional",
    description:
      "A screenshot of a bank transfer request doesn't make clients take you seriously or pay you on time.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "No income proof for your bank",
    description:
      "When you apply for a loan, the bank asks for income records. You have none. Application rejected.",
  },
];

const FEATURES = [
  {
    title: "Professional payment links",
    description:
      "Generate a payment link in seconds. Send it to your client over WhatsApp, email, or anywhere. They pay by FPX, DuitNow, Touch 'n Go, or card. You get paid in MYR directly to your bank.",
  },
  {
    title: "Automatic invoices",
    description:
      "Every payment generates a proper invoice instantly. Invoice number, date, amount, service description, both parties' details. Stored permanently. No manual work.",
  },
  {
    title: "Automatic payment reminders",
    description:
      "Kreato follows up with your clients automatically before the due date, on the due date, and after. You stop chasing. They start paying.",
  },
  {
    title: "Recurring billing",
    description:
      "Put retainer clients on autopay. Set the amount and billing cycle once. Kreato collects every month automatically.",
  },
  {
    title: "Income documentation",
    description:
      "Export a clean, formal income statement anytime. Use it for your bank loan application, your LHDN tax filing, or proof of income. Finally have the paperwork that proves what you earn.",
  },
];

export default function AgenciesFreelancersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-[Inter,system-ui,sans-serif]">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Kreato</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="pt-20 pb-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse flex-shrink-0" />
            Built for Malaysian freelancers and agencies
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            The payment platform built for{" "}
            <span className="text-violet-600">Malaysian freelancers</span> and agencies.
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Send professional payment links, collect via FPX, DuitNow, or card, and get automatic
            invoices — all in one place. Get paid in MYR directly to your Malaysian bank account.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-violet-600 text-white font-semibold text-base hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
          >
            Get started free
          </Link>

          <p className="text-sm text-gray-400 mt-4">
            No monthly fees. No setup fees. You only pay when you get paid.
          </p>

          {/* Payment method pills */}
          <div className="mt-12 overflow-x-auto pb-2 -mx-6 px-6">
            <div className="flex items-center gap-2 w-max mx-auto">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain points ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-16 tracking-tight">
            Still running your business like this?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PAIN_POINTS.map((point) => (
              <div key={point.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mb-5">
                  {point.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{point.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-20 tracking-tight">
            Everything you need to get paid properly
          </h2>

          <div className="space-y-24">
            {FEATURES.map((feature, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={feature.title}
                  className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12`}
                >
                  {/* Text */}
                  <div className="flex-1">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 text-violet-600 font-bold text-sm mb-5">
                      {idx + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed text-base">{feature.description}</p>
                  </div>

                  {/* Graphic placeholder */}
                  <div className="flex-1 w-full">
                    <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-100 aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-violet-200 rounded-xl mx-auto mb-3" />
                        <div className="h-2 w-24 bg-violet-200 rounded-full mx-auto mb-2" />
                        <div className="h-2 w-16 bg-violet-100 rounded-full mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 tracking-tight">
            Simple, transparent pricing
          </h2>

          <div className="bg-white rounded-2xl border-2 border-violet-500 shadow-xl shadow-violet-100 p-10">
            <p className="text-5xl font-bold text-gray-900 tracking-tight">
              5%{" "}
              <span className="text-3xl text-gray-400 font-semibold">+</span>{" "}
              RM1.00
            </p>
            <p className="text-gray-400 text-sm mt-2 mb-8">per transaction</p>

            <div className="space-y-3 mb-8 text-sm text-gray-600">
              {[
                "No monthly fees",
                "No setup fees",
                "No hidden charges",
                "You only pay when you get paid",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 justify-center">
                  <svg className="w-4 h-4 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-violet-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-5 tracking-tight">
            Ready to get paid properly?
          </h2>
          <p className="text-violet-200 text-lg mb-10 leading-relaxed">
            Join Malaysian freelancers and agencies who have stopped chasing payments and started
            running a real business.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-violet-700 font-semibold text-base hover:bg-violet-50 transition-colors shadow-lg"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pb-10 border-b border-gray-800">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="font-bold text-white text-lg tracking-tight">Kreato</span>
              </Link>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                The payment platform for Malaysian freelancers and agencies.
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <p className="text-gray-500 text-sm pt-8 text-center sm:text-left">
            © 2026 Kreato. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
