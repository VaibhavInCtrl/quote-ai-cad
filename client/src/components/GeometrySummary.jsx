function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function StatCard({ label, value, unit, accent }) {
  return (
    <div className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-panel">
      <div
        className="mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ backgroundColor: accent.background, color: accent.foreground }}
      >
        {label}
      </div>
      <div className="font-display text-3xl font-bold text-ink">
        {value}
        {unit ? <span className="ml-1 text-base text-slate-500">{unit}</span> : null}
      </div>
    </div>
  );
}

export default function GeometrySummary({ geometry, fileName }) {
  const accents = [
    { background: "#fff1ec", foreground: "#d9481c" },
    { background: "#fff6d8", foreground: "#9a6700" },
    { background: "#e8fff8", foreground: "#0f766e" },
    { background: "#eef2ff", foreground: "#3751ff" },
    { background: "#f1f5f9", foreground: "#334155" },
  ];

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-panel backdrop-blur print-panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
            Parsed Geometry
          </p>
          <h3 className="mt-2 font-display text-3xl font-bold text-ink">
            {fileName}
          </h3>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          QuoteAI extracted manufacturing-ready geometry metadata from the STL.
          Dimensions are displayed using a millimeter assumption because STL
          files do not carry native units.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="X"
          value={formatNumber(geometry.dimensions_mm.x)}
          unit="mm"
          accent={accents[0]}
        />
        <StatCard
          label="Y"
          value={formatNumber(geometry.dimensions_mm.y)}
          unit="mm"
          accent={accents[1]}
        />
        <StatCard
          label="Z"
          value={formatNumber(geometry.dimensions_mm.z)}
          unit="mm"
          accent={accents[2]}
        />
        <StatCard
          label="Volume"
          value={formatNumber(geometry.volume_mm3)}
          unit="mm³"
          accent={accents[3]}
        />
        <StatCard
          label="Triangles"
          value={formatNumber(geometry.triangle_count)}
          accent={accents[4]}
        />
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
        Surface area: {formatNumber(geometry.surface_area_mm2)} mm²
      </div>
    </section>
  );
}
