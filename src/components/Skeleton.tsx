export function SkelLine({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-white/10 ${className}`} />
  );
}

export function SkelCard() {
  return (
    <div className="rounded-2xl surface p-4">
      <SkelLine className="h-3 w-24" />
      <div className="mt-4 flex items-center justify-between">
        <SkelLine className="h-5 w-28" />
        <SkelLine className="h-5 w-28" />
      </div>
    </div>
  );
}
