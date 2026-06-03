import { Landing } from "@/components/Landing";

// Fully static -> instant first paint for new visitors.
// Logged-in users are bounced to /home client-side (local cookie read).
export default function Home() {
  return <Landing />;
}
