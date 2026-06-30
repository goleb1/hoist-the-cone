import { getConeReport } from "@/lib/mlb";

export async function GET() {
  const report = await getConeReport();
  return Response.json(report, {
    headers: {
      "Cache-Control": report.state === "live" ? "s-maxage=30, stale-while-revalidate=30" : "s-maxage=300, stale-while-revalidate=900",
    },
  });
}
