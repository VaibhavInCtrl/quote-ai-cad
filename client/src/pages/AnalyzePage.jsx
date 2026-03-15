import { useState } from "react";
import { useNavigate } from "react-router-dom";

import FileDropzone from "../components/FileDropzone";
import GeometrySummary from "../components/GeometrySummary";
import LoadingState from "../components/LoadingState";
import { saveQuoteSession } from "../lib/quoteSession";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function parseError(response) {
  try {
    const data = await response.json();
    return data.error || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [geometryPayload, setGeometryPayload] = useState(null);
  const [analyzeError, setAnalyzeError] = useState("");
  const [quoteError, setQuoteError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);

  async function handleFileSelect(file) {
    setSelectedFile(file);
    setGeometryPayload(null);
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

      const quotePayload = await response.json();
      const sessionPayload = {
        file_name: geometryPayload.file_name,
        file_size_bytes: geometryPayload.file_size_bytes,
        geometry: geometryPayload.geometry,
        quote: quotePayload.quote,
        model: quotePayload.model,
        usage: quotePayload.usage,
      };

      saveQuoteSession(sessionPayload);
      navigate("/quote", {
        state: sessionPayload,
      });
    } catch (error) {
      setQuoteError(
        error instanceof Error ? error.message : "Quote generation failed.",
      );
    } finally {
      setIsQuoting(false);
    }
  }

  const canGenerateQuote =
    Boolean(geometryPayload?.geometry) && !isQuoting && !isAnalyzing;
  const currentStep = isAnalyzing
    ? "Parsing geometry"
    : isQuoting
      ? "Generating quote"
      : geometryPayload
        ? "Ready for quote"
        : "Awaiting STL";

  return (
    <main className="overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/60 p-6 shadow-panel backdrop-blur md:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] xl:items-end">
            <div className="min-w-0">
              <div className="inline-flex rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                QuoteAI
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-[clamp(3rem,7vw,5.75rem)] font-bold leading-[0.92] tracking-tight text-ink">
                AI-native quoting for parts that start as raw geometry.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Upload an STL, extract geometry instantly, and generate a
                structured manufacturing quote with ranked processes, materials,
                pricing, lead time, and DFM guidance.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-3">
              {[
                ["Step 1", "Upload STL"],
                ["Step 2", "Analyze mesh"],
                ["Step 3", "Generate quote"],
              ].map(([label, text], index) => (
                <div
                  key={label}
                  className={`min-w-0 rounded-[1.5rem] border p-4 ${
                    index === 2 && isQuoting
                      ? "border-ember/40 bg-orange-50"
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

        <section className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(20rem,0.76fr)_minmax(0,1.24fr)]">
          <div className="space-y-6">
            <FileDropzone
              disabled={isAnalyzing || isQuoting}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
            />

            <div className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-panel backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                    Workflow state
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                    {currentStep}
                  </h2>
                </div>
                <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  Redirects to a dedicated quote page
                </div>
              </div>

              <button
                type="button"
                disabled={!canGenerateQuote}
                onClick={handleGenerateQuote}
                className={`mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold transition ${
                  !canGenerateQuote
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
                body="We are preparing the quote page with process ranking, price range, lead time, and DFM guidance."
              />
            ) : (
              <section className="rounded-[2rem] border border-white/80 bg-white/55 p-6 shadow-panel backdrop-blur">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                  Next Step
                </p>
                <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-tight text-ink">
                  Quote results open on a dedicated page
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                  Keep this upload view focused on analysis. Once the quote is
                  generated, QuoteAI sends you to a separate presentation page for
                  the estimate.
                </p>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
