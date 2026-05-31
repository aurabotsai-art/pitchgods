import { SkelLine } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <SkelLine className="h-4 w-20" />
      <SkelLine className="mx-auto mt-6 h-3 w-40" />
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex flex-1 flex-col items-center gap-2">
          <SkelLine className="h-12 w-16" />
          <SkelLine className="h-4 w-20" />
        </div>
        <SkelLine className="h-7 w-8" />
        <div className="flex flex-1 flex-col items-center gap-2">
          <SkelLine className="h-12 w-16" />
          <SkelLine className="h-4 w-20" />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkelLine key={i} className="h-12 w-full" />
        ))}
      </div>
    </main>
  );
}
