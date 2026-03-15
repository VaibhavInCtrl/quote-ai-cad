const suppliersByProcess = {
  "CNC machining": [
    {
      name: "AxisForge Precision",
      location: "Austin, TX",
      rating: "4.9/5",
      leadTime: "6-9 days",
    },
    {
      name: "Blue Mesa Manufacturing",
      location: "Phoenix, AZ",
      rating: "4.8/5",
      leadTime: "7-10 days",
    },
    {
      name: "Northline Metals",
      location: "Detroit, MI",
      rating: "4.7/5",
      leadTime: "8-12 days",
    },
  ],
  "3D printing": [
    {
      name: "LayerCraft Labs",
      location: "San Jose, CA",
      rating: "4.9/5",
      leadTime: "3-5 days",
    },
    {
      name: "RapidForm Collective",
      location: "Boulder, CO",
      rating: "4.8/5",
      leadTime: "4-6 days",
    },
    {
      name: "ProtoGrid Additive",
      location: "Raleigh, NC",
      rating: "4.7/5",
      leadTime: "5-7 days",
    },
  ],
  "sheet metal fabrication": [
    {
      name: "Bendworks Supply",
      location: "Chicago, IL",
      rating: "4.8/5",
      leadTime: "5-8 days",
    },
    {
      name: "FlatPattern Co.",
      location: "Cleveland, OH",
      rating: "4.7/5",
      leadTime: "6-9 days",
    },
    {
      name: "Ironline Systems",
      location: "Nashville, TN",
      rating: "4.6/5",
      leadTime: "7-10 days",
    },
  ],
  "injection molding": [
    {
      name: "MoldSpring Partners",
      location: "Charlotte, NC",
      rating: "4.9/5",
      leadTime: "18-24 days",
    },
    {
      name: "Toolpath Plastics",
      location: "Grand Rapids, MI",
      rating: "4.8/5",
      leadTime: "20-28 days",
    },
    {
      name: "Vector Molds",
      location: "Tijuana, MX",
      rating: "4.7/5",
      leadTime: "16-23 days",
    },
  ],
};

function pickSuppliers(processName) {
  const normalized = (processName || "").toLowerCase();
  const key = Object.keys(suppliersByProcess).find((process) =>
    normalized.includes(process.toLowerCase()),
  );

  return suppliersByProcess[key ?? "CNC machining"];
}

export default function SupplierCards({ primaryProcess }) {
  const suppliers = pickSuppliers(primaryProcess);

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-panel backdrop-blur print-panel">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
            Matched Suppliers
          </p>
          <h3 className="mt-2 font-display text-3xl font-bold text-ink">
            Mock sourcing matches
          </h3>
        </div>
        <p className="max-w-md text-sm text-slate-600">
          A portfolio-style sourcing panel inspired by manufacturing marketplace
          workflows.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <article
            key={supplier.name}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5"
          >
            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Supplier match
            </div>
            <h4 className="mt-4 font-display text-2xl font-bold text-ink">
              {supplier.name}
            </h4>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Location: {supplier.location}</p>
              <p>Rating: {supplier.rating}</p>
              <p>Lead time: {supplier.leadTime}</p>
            </div>
            <button
              type="button"
              className="mt-6 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Request Quote
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
