export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-serif text-[26px] leading-none text-ink">Maicro</span>
    </span>
  );
}
