import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Landing } from "@/components/Landing";

export default async function Home() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();

  if (claimData?.claims?.sub) redirect("/home");

  return <Landing />;
}
