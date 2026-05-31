import { SkelLine } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
      <SkelLine className="h-4 w-32" />
      <SkelLine className="mt-6 h-9 w-60" />
      <div className="mt-8 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkelLine key={i} className="h-20 w-full" />
        ))}
      </div>
      <SkelLine className="mt-8 h-14 w-full" />
      <SkelLine className="mt-3 h-14 w-full" />
    </main>
  );
}
