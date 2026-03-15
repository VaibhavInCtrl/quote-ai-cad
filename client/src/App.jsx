import { useState } from "react";

import FileDropzone from "./components/FileDropzone";
import GeometrySummary from "./components/GeometrySummary";
import LoadingState from "./components/LoadingState";
import QuoteResults from "./components/QuoteResults";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function parseError(response) {
  try {
    const data = await response.json();
    return data.error || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [geometryPayload, setGeometryPayload] = useState(null);
  const [quotePayload, setQuotePayload] = useState(null);
  const [analyzeError, setAnalyzeError] = useState("");
  const [quoteError, setQuoteError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);

  async function handleFileSelect(file) {
    setSelectedFile(file);
    setGeometryPayload(null);
    setQuotePayload(null);
    setQuoteError("");
    setAnalyzeError("");
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const data = await response.json();
      setGeometryPayload(data);
    } catch (error) {
      setGeometryPayload(null);
      setAnalyzeError(error instanceof Error ? error.message : "STL parse failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleGenerateQuote() {
    if (!geometryPayload?.geometry) {
      return;
    }

    setQuoteError("");
    setIsQuoting(true);

    try {
      const response = await fetch(`${API_URL}/api/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          geometry: geometryPayload.geometry,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const data = await response.json();
      setQuotePayload(data);
    } catch (error) {
      setQuotePayload(null);
      setQuoteError(
        error instanceof Error ? error.message : "Quote generation failed.",
      );
    } finally {
      setIsQuoting(false);
    }
  }

  const currentStep = isAnalyzing
    ? "Parsing geometry"
    : quotePayload
      ? "Quote ready"
      : geometryPayload
        ? "Ready for quote"
        : "Awaiting STL";

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2.25rem] border border-white/70 bg-white/60 p-6 shadow-panel backdrop-blur md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="inline-flex rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                QuoteAI
              </div>
              <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold tracking-tight text-ink md:text-7xl">
                AI-native quoting for parts that start as raw geometry.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Upload an STL, extract geometry instantly, and generate a
                structured manufacturing quote with ranked processes, materials,
                pricing, lead time, and DFM guidance.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Step 1", "Upload STL"],
                ["Step 2", "Analyze mesh"],
                ["Step 3", "Generate quote"],
              ].map(([label, text], index) => (
                <div
                  key={label}
                  className={`rounded-[1.5rem] border p-4 ${
                    index === 2 && quotePayload
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-white/80 bg-white/80"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-3 font-display text-2xl font-bold text-ink">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <FileDropzone
              disabled={isAnalyzing || isQuoting}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
            />

            <div className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-panel backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                    Workflow state
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                    {currentStep}
                  </h2>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  Separate `/analyze` and `/quote` API flow
                </div>
              </div>

              <button
                type="button"
                disabled={!geometryPayload?.geometry || isQuoting || isAnalyzing}
                onClick={handleGenerateQuote}
                className={`mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold transition ${
                  !geometryPayload?.geometry || isQuoting || isAnalyzing
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-ember text-white hover:bg-orange-600"
                }`}
              >
                {isQuoting ? "Generating quote..." : "Generate Quote"}
              </button>

              {analyzeError ? (
                <p className="mt-4 text-sm text-red-600">{analyzeError}</p>
              ) : null}
              {quoteError ? (
                <p className="mt-4 text-sm text-red-600">{quoteError}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            {isAnalyzing ? (
              <LoadingState
                title="Parsing STL geometry"
                body="Extracting bounding box dimensions, volume, surface area, and triangle count."
              />
            ) : null}

            {geometryPayload?.geometry ? (
              <GeometrySummary
                geometry={geometryPayload.geometry}
                fileName={geometryPayload.file_name}
              />
            ) : null}

            {isQuoting ? (
              <LoadingState
                title="Building manufacturing quote"
                body="Claude is ranking processes, suggesting materials, and producing DFM guidance."
              />
            ) : null}

            {quotePayload?.quote && geometryPayload?.geometry ? (
              <QuoteResults
                geometry={geometryPayload.geometry}
                quote={quotePayload.quote}
              />
            ) : (
              <section className="rounded-[2rem] border border-white/80 bg-white/55 p-6 shadow-panel backdrop-blur">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                  Preview
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                  Quote results will appear here
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                  Once geometry analysis is complete, generate a quote to see
                  ranked manufacturing processes, price range, lead time, DFM
                  tips, and matched supplier cards.
                </p>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
