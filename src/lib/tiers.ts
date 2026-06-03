export type Tier = { name: string; min: number };

const TIERS: Tier[] = [
  { name: "Park Player", min: 0 },
  { name: "Sunday League", min: 100 },
  { name: "Academy", min: 300 },
  { name: "Pro", min: 700 },
  { name: "Cult Hero", min: 1500 },
  { name: "National Team", min: 3000 },
  { name: "Legend", min: 6000 },
  { name: "GOAT", min: 12000 },
];

export function tierForGlory(glory: number): { name: string; index: number; next: Tier | null } {
  let i = 0;
  for (let k = 0; k < TIERS.length; k++) if (glory >= TIERS[k].min) i = k;
  return { name: TIERS[i].name, index: i, next: TIERS[i + 1] ?? null };
}
