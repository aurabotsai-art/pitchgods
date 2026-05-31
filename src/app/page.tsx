export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, #052e16 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-pitch/40 bg-pitch/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-pitch">
          World Cup 2026
        </span>

        <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
          PITCH
          <br />
          <span className="text-pitch">PERFECT</span>
        </h1>

        <p className="mt-6 text-lg leading-7 text-zinc-400">
          Out-predict your friends. Climb from nobody to national legend.
          <span className="mt-2 block font-medium text-glory">
            No money. Pure glory.
          </span>
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <button
            disabled
            className="h-14 w-full rounded-2xl bg-pitch text-base font-bold text-black opacity-90 transition active:scale-[0.98]"
          >
            Play as guest
          </button>
          <button
            disabled
            className="h-14 w-full rounded-2xl border border-white/15 text-base font-semibold text-zinc-200 transition active:scale-[0.98]"
          >
            Sign in
          </button>
        </div>

        <p className="mt-8 text-xs text-zinc-600">
          Phase 0 · skeleton live · auth lands next
        </p>
      </div>
    </main>
  );
}
