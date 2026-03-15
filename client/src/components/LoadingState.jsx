export default function LoadingState({ title, body }) {
  return (
    <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-panel">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-ember" />
        <div>
          <h3 className="font-display text-2xl font-bold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{body}</p>
        </div>
      </div>
    </div>
  );
}
