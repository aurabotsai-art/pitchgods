import { getActiveChaos } from "@/lib/data";
import { ChaosCountdown } from "./ChaosCountdown";

export async function ChaosBanner() {
  const chaos = await getActiveChaos();
  if (!chaos) return null;
  return (
    <ChaosCountdown
      multiplier={chaos.multiplier}
      endsAt={chaos.ends_at}
      title={chaos.title}
      sponsor={chaos.sponsor_name}
    />
  );
}
