/** value/max bar; turns orange when over 100%. */
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${pct > 100 ? "bg-secondary" : "bg-primary"}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}
