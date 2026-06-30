import { getConeReport } from "@/lib/mlb";
import type { ConeReport, ConeStatus, TrafficMetrics } from "@/lib/types";

const statusStyles: Record<ConeStatus, string> = {
  "FULL HOIST": "bg-orange-500 text-black shadow-[0_0_48px_rgba(255,106,0,0.42)]",
  "CONE UP": "bg-yellow-300 text-black shadow-[0_0_36px_rgba(246,195,68,0.32)]",
  "CONE WATCH": "bg-stone-100 text-stone-950",
  "PARTIAL HOIST": "bg-orange-200 text-stone-950",
  "CONE DOWN": "bg-stone-800 text-stone-100",
  "CONE IN STORAGE": "bg-black text-orange-200",
};

function formatGeneratedAt(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function scoreLine(report: ConeReport) {
  const game = report.relevantGame;
  if (!game) return "Signal unavailable";
  if (game.isScheduled) {
    return `${game.side === "home" ? "vs" : "at"} ${game.opponent}`;
  }
  const pirates = game.piratesScore ?? "—";
  const opponent = game.opponentScore ?? "—";
  return game.side === "home" ? `Pirates ${pirates}, ${game.opponent} ${opponent}` : `Pirates ${pirates}, ${game.opponent} ${opponent}`;
}

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-cream/80 p-5 shadow-sm shadow-black/5 backdrop-blur">
      <div className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.22em] text-asphalt/55">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-tight text-asphalt">{value}</div>
      {note ? <div className="mt-2 text-sm leading-5 text-asphalt/65">{note}</div> : null}
    </div>
  );
}

function ConeMeter({ score, status }: { score: number; status: ConeStatus }) {
  return (
    <div className="relative flex aspect-square min-h-64 items-center justify-center overflow-hidden rounded-[2rem] border border-orange-300/30 bg-[radial-gradient(circle_at_50%_35%,rgba(255,106,0,0.22),transparent_34%),linear-gradient(160deg,#1b1712,#060504)] p-6 text-cream shadow-2xl shadow-black/30">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[repeating-linear-gradient(135deg,rgba(255,106,0,0.22)_0_12px,transparent_12px_24px)] opacity-60" />
      <div className="relative z-10 text-center">
        <div className="mx-auto mb-5 h-28 w-28 cone-shape" aria-hidden="true" />
        <div className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-orange-200/80">Cone Index</div>
        <div className="mt-1 text-7xl font-black leading-none tracking-[-0.08em]">{score}</div>
        <div className={`mx-auto mt-5 inline-flex rounded-full px-4 py-2 font-mono text-xs font-black uppercase tracking-[0.18em] ${statusStyles[status]}`}>
          {status}
        </div>
      </div>
    </div>
  );
}

function GameCard({ report }: { report: ConeReport }) {
  const game = report.relevantGame;
  if (!game) {
    return (
      <section className="panel">
        <Eyebrow>Current report</Eyebrow>
        <h2 className="section-title">MLB feed unavailable</h2>
        <p className="copy mt-3">No official signal reached the cone office. This is annoying, but not spiritually fatal.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>{game.isLive ? "Live traffic" : game.isScheduled ? "Next deployment" : "Latest report"}</Eyebrow>
          <h2 className="section-title mt-2">{scoreLine(report)}</h2>
          <p className="copy mt-3">{report.explanation}</p>
        </div>
        <div className="rounded-2xl bg-black px-4 py-3 text-right text-cream">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-orange-200/70">{game.status}</div>
          <div className="mt-1 text-lg font-black">{game.inning ?? game.displayDate}</div>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Mini label="Venue" value={game.venue ?? "—"} />
        <Mini label="Opponent" value={`${game.side === "home" ? "vs" : "at"} ${game.opponent}`} />
        <Mini label="Pirates starter" value={game.probablePiratesPitcher ?? "TBD"} />
        <Mini label="Data status" value={report.dataFreshness} />
      </div>
    </section>
  );
}

function TrafficReport({ traffic }: { traffic: TrafficMetrics | null }) {
  const metrics = [
    { label: "Traffic cleared", value: traffic?.runs == null ? "—" : `${traffic.runs}`, note: "Pirates runs" },
    { label: "Traffic generated", value: traffic?.hits == null ? "—" : `${traffic.hits}`, note: "Pirates hits" },
    { label: "Lanes opened", value: traffic?.homeRuns == null ? "—" : `${traffic.homeRuns}`, note: "Home runs" },
    { label: "Lane changes", value: traffic?.stolenBases == null ? "—" : `${traffic.stolenBases}`, note: "Stolen bases" },
    { label: "Congestion left", value: traffic?.leftOnBase == null ? "—" : `${traffic.leftOnBase}`, note: "Runners left on base" },
    { label: "Hazards removed", value: traffic?.pitcherStrikeouts == null ? "—" : `${traffic.pitcherStrikeouts}`, note: "Pitching strikeouts" },
  ];

  return (
    <section className="panel">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Traffic report</Eyebrow>
          <h2 className="section-title mt-2">Municipal baseball conditions</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-asphalt/60">Runs, baserunners, homers, steals, and other orange-plastic implications.</p>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>
    </section>
  );
}

function RecentHoists({ report }: { report: ConeReport }) {
  return (
    <section className="panel">
      <Eyebrow>Recent hoists</Eyebrow>
      <h2 className="section-title mt-2">Last five completed reports</h2>
      <div className="mt-6 divide-y divide-black/10 overflow-hidden rounded-3xl border border-black/10 bg-white/45">
        {report.recentGames.length === 0 ? (
          <p className="copy p-5">No recent games reached the traffic office.</p>
        ) : (
          report.recentGames.map((game) => (
            <article key={game.gamePk} className="grid gap-4 p-5 md:grid-cols-[7rem_1fr_auto] md:items-center">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-asphalt/55">{game.displayDate}</div>
              <div>
                <h3 className="font-bold text-asphalt">Pirates {game.piratesScore}, {game.opponent} {game.opponentScore}</h3>
                <p className="mt-1 text-sm leading-6 text-asphalt/65">{game.recap}</p>
              </div>
              <div className={`w-fit rounded-full px-3 py-1.5 font-mono text-[0.65rem] font-black uppercase tracking-[0.15em] ${statusStyles[game.coneStatus]}`}>
                {game.coneStatus}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function StandingsStrip({ report }: { report: ConeReport }) {
  const standings = report.standings;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Mini label="Record" value={standings?.record ?? "—"} />
      <Mini label="Streak" value={standings?.streak ?? "—"} />
      <Mini label="Run diff" value={standings?.runDifferential == null ? "—" : `${standings.runDifferential > 0 ? "+" : ""}${standings.runDifferential}`} />
      <Mini label="WC back" value={standings?.wildCardGamesBack ?? "—"} />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/35 px-4 py-3">
      <div className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-asphalt/50">{label}</div>
      <div className="mt-1 text-sm font-bold leading-5 text-asphalt">{value}</div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-xs font-black uppercase tracking-[0.28em] text-orange-600">{children}</div>;
}

export default async function Home() {
  const report = await getConeReport();

  return (
    <main className="min-h-screen overflow-hidden bg-cream text-asphalt">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(18,16,13,0.04)_1px,transparent_1px),linear-gradient(rgba(18,16,13,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 rounded-full border border-black/10 bg-white/50 px-5 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 cone-mini" aria-hidden="true" />
            <div>
              <div className="text-sm font-black uppercase tracking-[0.18em]">Hoist the Cone</div>
              <div className="text-xs font-semibold text-asphalt/55">Unofficial Buccos traffic desk</div>
            </div>
          </div>
          <div className="hidden font-mono text-xs font-bold uppercase tracking-[0.18em] text-asphalt/55 sm:block">Updated {formatGeneratedAt(report.generatedAt)} ET</div>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-16">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 font-mono text-xs font-black uppercase tracking-[0.22em] text-orange-700">The unofficial Buccos traffic report</div>
            <h1 className="max-w-4xl text-6xl font-black leading-[0.9] tracking-[-0.075em] text-asphalt sm:text-7xl lg:text-8xl">
              Cone status: <span className="text-orange-600">{report.status}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-asphalt/70 sm:text-2xl">{report.headline}. {report.explanation}</p>
            <div className="mt-8">
              <StandingsStrip report={report} />
            </div>
          </div>
          <ConeMeter score={report.score} status={report.status} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.88fr]">
          <GameCard report={report} />
          <TrafficReport traffic={report.traffic} />
        </div>

        <div className="mt-6">
          <RecentHoists report={report} />
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <details className="panel group">
            <summary className="cursor-pointer list-none">
              <Eyebrow>What is this?</Eyebrow>
              <h2 className="section-title mt-2 flex items-center justify-between gap-4">
                Origin report
                <span className="text-2xl text-orange-600 transition group-open:rotate-45">+</span>
              </h2>
            </summary>
            <p className="copy mt-5">A weird shirt became a dugout bit. A dugout bit became a fan ritual. Now every Pirates rally comes with orange-plastic implications.</p>
            <p className="copy mt-4">This is the unofficial traffic report for the cone era: dry municipal seriousness applied to deeply unserious baseball joy.</p>
          </details>

          <section className="panel !border-orange-300/20 !bg-asphalt text-cream">
            <Eyebrow>How the index works</Eyebrow>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-cream">Deeply unofficial. Surprisingly strict.</h2>
            <p className="mt-4 text-base leading-7 text-cream/75">The Cone Index scores Pirates conditions from game result, score margin, run production, homers, steals, pitching, streak, and residual congestion. It is not endorsed by MLB, PennDOT, or any responsible adult.</p>
          </section>
        </section>

        <footer className="mt-10 flex flex-col gap-2 border-t border-black/10 py-8 text-sm text-asphalt/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Unofficial fan project. Not affiliated with MLB or the Pittsburgh Pirates. Data via MLB Stats API.</p>
          <p className="font-mono uppercase tracking-[0.18em]">Acquire cones legally.</p>
        </footer>
      </div>
    </main>
  );
}
