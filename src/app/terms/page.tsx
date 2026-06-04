import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Pitch Gods",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 text-sm leading-7 text-zinc-300">
      <Link href="/" className="text-zinc-500">
        ← Back
      </Link>
      <h1 className="mt-4 text-3xl font-black text-white">Terms of Service</h1>
      <p className="mt-1 text-xs text-zinc-500">Last updated: June 2026</p>

      <p className="mt-6">
        By using Pitch Gods you agree to these terms. If you don&apos;t agree,
        please don&apos;t use the app.
      </p>

      <H>1. What Pitch Gods is</H>
      <p>
        A free game of football knowledge and prediction. It is{" "}
        <b>entertainment and skill-based</b> — there is{" "}
        <b>no real-money betting, no wagering, and no cash prizes</b>. You never
        stake money on an outcome.
      </p>

      <H>2. Virtual items</H>
      <p>
        &quot;Glory&quot;, &quot;Coins&quot;, badges, and cosmetics are virtual,
        have <b>no monetary value</b>, are non-transferable, and cannot be
        exchanged for money. Coins are earned by playing and can only be spent on
        in-app cosmetics or sponsor rewards.
      </p>

      <H>3. Acceptable use</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>Be respectful in chat. No hate, harassment, spam, or illegal content.</li>
        <li>No cheating, automation, multiple accounts to game leaderboards, or exploiting bugs.</li>
        <li>We may suspend or remove accounts that break these rules.</li>
      </ul>

      <H>4. Sponsors</H>
      <p>
        The app may show sponsor content, clearly labelled as &quot;Sponsored&quot;.
        Any rewards or discounts are provided by the sponsor, subject to their
        terms.
      </p>

      <H>5. Availability</H>
      <p>
        We provide the app &quot;as is&quot; and may change, pause, or end
        features at any time. Match data comes from third parties and may contain
        delays or errors.
      </p>

      <H>6. Liability</H>
      <p>
        To the fullest extent allowed by law, Pitch Gods is not liable for any
        indirect or incidental damages arising from your use of the app.
      </p>

      <H>7. Changes & contact</H>
      <p>
        We may update these terms; continued use means you accept them. Contact:{" "}
        <a href="mailto:dhedhimuhammed@gmail.com" className="text-pitch underline">
          dhedhimuhammed@gmail.com
        </a>
        .
      </p>

      <p className="mt-8 text-xs text-zinc-600">
        See also our{" "}
        <Link href="/privacy" className="text-pitch underline">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-6 text-lg font-bold text-white">{children}</h2>;
}
