import { useMemo } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import QuoteResults from "../components/QuoteResults";
import { loadQuoteSession } from "../lib/quoteSession";

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export default function QuotePage() {
  const location = useLocation();
  const quoteSession = useMemo(
    () => location.state ?? loadQuoteSession(),
    [location.state],
  );

  if (!quoteSession?.geometry || !quoteSession?.quote) {
    return <Navigate to="/" replace />;
  }

  const { geometry, quote, file_name: fileName, model } = quoteSession;

  return (
    <main className="overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1520px] space-y-8">
        <header className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/70 p-6 shadow-panel backdrop-blur md:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.8fr)] xl:items-end">
            <div className="min-w-0">
              <div className="inline-flex rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                QuoteAI Estimate
              </div>
              <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.8rem,5.5vw,5.2rem)] font-bold leading-[0.94] tracking-tight text-ink">
                Quote results for {fileName}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                This page is dedicated to the final sourcing estimate so the quote,
                process recommendations, and materials can breathe without competing
                with the upload workflow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/80 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Geometry snapshot
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {formatNumber(geometry.dimensions_mm.x)} x{" "}
                  {formatNumber(geometry.dimensions_mm.y)} x{" "}
                  {formatNumber(geometry.dimensions_mm.z)} mm
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  {formatNumber(geometry.triangle_count)} triangles
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/80 bg-white p-5">
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/"
                    className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Upload another part
                  </Link>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex rounded-full bg-slateblue px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <QuoteResults geometry={geometry} quote={quote} />
      </div>
    </main>
  );
}
