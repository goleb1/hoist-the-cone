import { getConeReport } from "@/lib/mlb";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getConeReport();
  const isLiveOrPregame = report.state === "live" || report.state === "scheduled";

  return Response.json(report, {
    headers: {
      "Cache-Control": isLiveOrPregame
        ? "no-store, max-age=0"
        : "s-maxage=60, stale-while-revalidate=120",
    },
  });
}
