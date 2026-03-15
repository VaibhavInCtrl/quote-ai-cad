function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function StatCard({ label, children, accent }) {
  return (
    <div className="min-w-0 rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-panel">
      <div
        className="mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ backgroundColor: accent.background, color: accent.foreground }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export default function GeometrySummary({ geometry, fileName }) {
  const accents = {
    envelope: { background: "#fff1ec", foreground: "#d9481c" },
    volume: { background: "#eef2ff", foreground: "#3751ff" },
    surface: { background: "#e8fff8", foreground: "#0f766e" },
    triangles: { background: "#f1f5f9", foreground: "#334155" },
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-panel backdrop-blur print-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
            Parsed Geometry
          </p>
          <h3 className="mt-2 break-words font-display text-[clamp(2rem,3vw,2.85rem)] font-bold leading-tight text-ink">
            {fileName}
          </h3>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          QuoteAI extracted manufacturing-ready geometry metadata from the STL.
          Dimensions are displayed using a millimeter assumption because STL
          files do not carry native units.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label="Envelope"
          accent={accents.envelope}
        >
          <div className="space-y-3">
            {[
              ["X", geometry.dimensions_mm.x],
              ["Y", geometry.dimensions_mm.y],
              ["Z", geometry.dimensions_mm.z],
            ].map(([axis, value]) => (
              <div
                key={axis}
                className="flex items-end justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {axis}
                </span>
                <span className="font-display text-2xl font-bold text-ink">
                  {formatNumber(value)}
                  <span className="ml-2 text-sm font-medium text-slate-500">mm</span>
                </span>
              </div>
            ))}
          </div>
        </StatCard>
        <StatCard
          label="Volume"
          accent={accents.volume}
        >
          <div className="min-w-0 font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-none text-ink">
            {formatNumber(geometry.volume_mm3)}
          </div>
          <p className="mt-3 text-sm text-slate-500">mm³ of enclosed material</p>
        </StatCard>
        <StatCard
          label="Surface"
          accent={accents.surface}
        >
          <div className="min-w-0 font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-none text-ink">
            {formatNumber(geometry.surface_area_mm2)}
          </div>
          <p className="mt-3 text-sm text-slate-500">mm² exposed area</p>
        </StatCard>
        <StatCard
          label="Mesh Density"
          accent={accents.triangles}
        >
          <div className="min-w-0 font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-none text-ink">
            {formatNumber(geometry.triangle_count)}
          </div>
          <p className="mt-3 text-sm text-slate-500">triangles in the STL mesh</p>
        </StatCard>
      </div>
    </section>
  );
}
