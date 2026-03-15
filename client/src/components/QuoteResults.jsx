import { useEffect, useMemo, useState } from "react";

import SupplierCards from "./SupplierCards";

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function normalizeProcesses(quote) {
  return (quote?.recommended_processes ?? []).map((process, index) => {
    if (typeof process === "string") {
      return {
        rank: index + 1,
        name: process,
        suitability_reason: "",
      };
    }

    return {
      rank: process.rank ?? index + 1,
      name: process.name ?? process.process ?? `Option ${index + 1}`,
      suitability_reason:
        process.suitability_reason ?? process.justification ?? process.reason ?? "",
    };
  });
}

function normalizeMaterialGroups(quote) {
  return (quote?.material_suggestions ?? []).map((group) => ({
    process: group.process ?? group.name ?? "",
    materials: Array.isArray(group.materials) ? group.materials : [],
  }));
}

function normalizeComplexity(quote) {
  if (typeof quote?.complexity_rating === "string") {
    return {
      level: quote.complexity_rating,
      justification: "",
    };
  }

  return {
    level: quote?.complexity_rating?.level ?? "medium",
    justification: quote?.complexity_rating?.justification ?? "",
  };
}

function leadTimeWidth(leadTime) {
  const min = Number(leadTime?.min) || 0;
  const max = Number(leadTime?.max) || min || 1;
  return Math.min(100, Math.max(16, (max / 30) * 100));
}

function findMaterialGroup(materialGroups, processName) {
  const normalized = (processName || "").toLowerCase();

  return (
    materialGroups.find((group) =>
      group.process.toLowerCase().includes(normalized),
    ) ?? materialGroups[0]
  );
}

export default function QuoteResults({ geometry, quote }) {
  const processes = useMemo(() => normalizeProcesses(quote), [quote]);
  const materialGroups = useMemo(() => normalizeMaterialGroups(quote), [quote]);
  const complexity = useMemo(() => normalizeComplexity(quote), [quote]);
  const [activeProcess, setActiveProcess] = useState(0);

  useEffect(() => {
    setActiveProcess(0);
  }, [quote]);

  const selectedProcess = processes[activeProcess] ?? processes[0];
  const materials = selectedProcess
    ? findMaterialGroup(materialGroups, selectedProcess.name)?.materials ?? []
    : [];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-panel backdrop-blur print-panel">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              Quote Output
            </p>
            <h3 className="mt-2 font-display text-4xl font-bold text-ink">
              Manufacturing estimate for a {complexity.level} complexity part
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              {complexity.justification ||
                "The LLM derived pricing and process recommendations from the extracted STL geometry."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Estimated price
              </p>
              <div className="mt-3 inline-flex rounded-full bg-ember px-4 py-2 font-display text-xl font-bold text-white">
                {currency(quote?.estimated_price_usd?.min)} -{" "}
                {currency(quote?.estimated_price_usd?.max)}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Lead time
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-3 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-gold via-ember to-slateblue"
                    style={{ width: `${leadTimeWidth(quote?.estimated_lead_time_days)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {quote?.estimated_lead_time_days?.min}-
                  {quote?.estimated_lead_time_days?.max} days
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Part size
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {geometry.dimensions_mm.x} x {geometry.dimensions_mm.y} x{" "}
              {geometry.dimensions_mm.z} mm
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Volume
            </p>
            <p className="mt-2 text-sm text-slate-700">{geometry.volume_mm3} mm³</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Surface area
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {geometry.surface_area_mm2} mm²
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Mesh density
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {geometry.triangle_count} triangles
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-panel backdrop-blur print-panel">
        <div className="flex flex-wrap gap-3">
          {processes.map((process, index) => (
            <button
              key={`${process.name}-${process.rank}`}
              type="button"
              onClick={() => setActiveProcess(index)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                index === activeProcess
                  ? "bg-ink text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {process.rank}. {process.name}
            </button>
          ))}
        </div>

        {selectedProcess ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Recommended process
              </p>
              <h4 className="mt-3 font-display text-3xl font-bold text-ink">
                {selectedProcess.name}
              </h4>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {selectedProcess.suitability_reason ||
                  "This process best balances geometry complexity, lead time, and expected unit economics."}
              </p>

              <div className="mt-8 grid gap-4">
                {materials.map((material) => (
                  <div
                    key={material.name}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <h5 className="font-display text-xl font-bold text-ink">
                      {material.name}
                    </h5>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
                          Pros
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-slate-600">
                          {(material.pros ?? []).map((pro) => (
                            <li key={pro}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">
                          Cons
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-slate-600">
                          {(material.cons ?? []).map((con) => (
                            <li key={con}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <aside className="space-y-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  DFM checklist
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                  {(quote?.design_for_manufacturing_tips ?? []).map((tip) => (
                    <li
                      key={tip}
                      className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                    >
                      <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-teal" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Export
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Use the browser print dialog to save this manufacturing quote as
                  a PDF portfolio artifact.
                </p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="mt-5 inline-flex rounded-full bg-slateblue px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                >
                  Export as PDF
                </button>
              </div>
            </aside>
          </div>
        ) : null}
      </section>

      <SupplierCards primaryProcess={selectedProcess?.name} />
    </div>
  );
}
