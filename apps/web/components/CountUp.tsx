/**
 * A statistic that counts up when it scrolls into view (public/motion.js).
 * Only plain numbers from 10 up count ("45%"); anything else ("1 op 5")
 * renders as it is. The real text always stays in the page.
 */
export function CountUp({ value }: { value: string }) {
  const m = value.match(/^(\d+)(%?)$/);
  if (!m || Number(m[1]) < 10) return <>{value}</>;
  return (
    <span data-count={m[1]} data-suffix={m[2]}>
      <span className="count-text">{value}</span>
    </span>
  );
}
