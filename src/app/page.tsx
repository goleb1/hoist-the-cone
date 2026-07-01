import { getConeReport } from "@/lib/mlb";
import { LiveConeDashboard } from "./live-cone-dashboard";

export const revalidate = 15;

export default async function Home() {
  const report = await getConeReport();
  return <LiveConeDashboard initialReport={report} />;
}
