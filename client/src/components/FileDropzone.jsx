import { useRef, useState } from "react";

function isStlFile(file) {
  return file?.name?.toLowerCase().endsWith(".stl");
}

export default function FileDropzone({ disabled, selectedFile, onFileSelect }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState("");

  function acceptFile(file) {
    if (!file) {
      return;
    }

    if (!isStlFile(file)) {
      setLocalError("Only .stl files are supported.");
      return;
    }

    setLocalError("");
    onFileSelect(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`group relative flex min-h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-dashed px-8 text-center transition ${
          dragActive
            ? "border-ember bg-white shadow-panel"
            : "border-slate-300 bg-white/75 hover:border-slateblue hover:bg-white"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <div className="absolute inset-0 bg-grain bg-[length:12px_12px] opacity-[0.08]" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-ink text-2xl text-white shadow-lg shadow-ink/20">
          STL
        </div>
        <h2 className="relative mt-6 font-display text-2xl font-bold text-ink">
          Drop a CAD mesh to start
        </h2>
        <p className="relative mt-3 max-w-md text-sm leading-6 text-slate-600">
          Upload a single STL file and QuoteAI will extract dimensions, volume,
          surface area, and part complexity before calling Claude for a quote.
        </p>
        <div className="relative mt-6 inline-flex rounded-full border border-slate-200 bg-sand px-4 py-2 text-sm font-medium text-slate-700">
          Drag and drop or choose a file
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".stl"
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
          Max file size: 25 MB
        </span>
        {selectedFile ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 shadow-sm">
            Selected: {selectedFile.name}
          </span>
        ) : null}
      </div>

      {localError ? <p className="text-sm text-red-600">{localError}</p> : null}
    </div>
  );
}
