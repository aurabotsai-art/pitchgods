import { SkelCard, SkelLine } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <SkelLine className="h-4 w-24" />
      <SkelLine className="mt-5 h-8 w-56" />
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkelCard key={i} />
        ))}
      </div>
    </main>
  );
}
