import { SkelLine } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <SkelLine className="h-4 w-24" />
      <div className="mt-5 grid grid-cols-2 gap-2">
        <SkelLine className="h-11 w-full" />
        <SkelLine className="h-11 w-full" />
      </div>
      <div className="mt-5 flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkelLine key={i} className="h-12 w-full" />
        ))}
      </div>
    </main>
  );
}
