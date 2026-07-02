"use client";

import { useEffect, useMemo, useState } from "react";
import type { ConeReport, ConeStatus, GameSummary, PageMode, TrafficMetrics } from "@/lib/types";

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

function formatShortFirstPitch(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatGameDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function scoreLine(game: GameSummary | null) {
  if (!game) return "Signal unavailable";
  if (game.isScheduled) return `${game.side === "home" ? "vs" : "at"} ${game.opponent}`;
  return `Pirates ${game.piratesScore ?? "—"}, ${game.opponent} ${game.opponentScore ?? "—"}`;
}

function easternDateParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function timeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const zonedAsUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));
  return zonedAsUtc - date.getTime();
}

function easternTimeToUtcMs(year: number, month: number, day: number, hour: number) {
  const utcGuess = Date.UTC(year, month - 1, day, hour);
  return utcGuess - timeZoneOffsetMs(new Date(utcGuess), "America/New_York");
}

function getPageMode(report: ConeReport): PageMode {
  if (report.state === "error") return "error";
  if (report.relevantGame?.isLive) return "live";

  const now = Date.now();
  const next = report.nextGame;
  if (next?.isScheduled) {
    const startsInMs = Date.parse(next.date) - now;
    if (startsInMs > 0 && startsInMs <= 4 * 60 * 60 * 1000) return "pregame";
  }

  const lastFinal = report.recentGames[0];
  if (lastFinal?.isFinal) {
    const { year, month, day } = easternDateParts(lastFinal.date);
    const cutoffMs = easternTimeToUtcMs(year, month, day + 1, 11);
    if (now < cutoffMs) return "postgame";
  }

  return "idle";
}

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-cream/80 p-3.5 shadow-sm shadow-black/5 backdrop-blur sm:rounded-3xl sm:p-5">
      <div className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-asphalt/55 sm:text-[0.66rem] sm:tracking-[0.22em]">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-asphalt sm:mt-3 sm:text-3xl">{value}</div>
      {note ? <div className="mt-1 text-xs leading-4 text-asphalt/65 sm:mt-2 sm:text-sm sm:leading-5">{note}</div> : null}
    </div>
  );
}

function ConeMeter({ score, status }: { score: number; status: ConeStatus }) {
  return (
    <div className="relative hidden aspect-square min-h-64 items-center justify-center overflow-hidden rounded-[2rem] border border-orange-300/30 bg-[radial-gradient(circle_at_50%_35%,rgba(255,106,0,0.22),transparent_34%),linear-gradient(160deg,#1b1712,#060504)] p-6 text-cream shadow-2xl shadow-black/30 lg:flex">
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

function ModeEyebrow({ mode }: { mode: PageMode }) {
  const label: Record<PageMode, string> = {
    live: "Live game control",
    pregame: "Pregame watch",
    postgame: "Postgame report",
    idle: "Cone office idle",
    error: "Signal interrupted",
  };
  return <div className="mb-4 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-orange-700 sm:mb-5 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.22em]">{label[mode]}</div>;
}

function Hero({ report, mode }: { report: ConeReport; mode: PageMode }) {
  const liveGame = report.relevantGame?.isLive ? report.relevantGame : null;
  const lastFinal = mode === "postgame" ? report.recentGames[0] : null;
  const nextGame = mode === "pregame" ? report.nextGame : null;

  const title = liveGame
    ? scoreLine(liveGame)
    : nextGame
      ? `Pirates ${nextGame.side === "home" ? "vs" : "at"} ${nextGame.opponent}`
      : lastFinal
        ? scoreLine(lastFinal)
        : `Cone status: ${report.status}`;

  const body = liveGame
    ? `${liveGame.inning ?? "Live"}. ${report.explanation}`
    : nextGame
      ? `First pitch ${formatGameDate(nextGame.date)}. Cone staged, starters checked, traffic report pending.`
      : lastFinal
        ? lastFinal.recap
        : report.nextGame
          ? `No active deployment. Next game: Pirates ${report.nextGame.side === "home" ? "vs" : "at"} ${report.nextGame.opponent}, ${formatGameDate(report.nextGame.date)}.`
          : report.explanation;

  return (
    <section className="grid gap-5 py-6 sm:gap-8 sm:py-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-16">
      <div>
        <ModeEyebrow mode={mode} />
        <h1 className="max-w-4xl text-[2.72rem] font-black leading-[0.9] tracking-[-0.075em] text-asphalt sm:text-7xl sm:leading-[0.86] lg:text-8xl">
          {title}
        </h1>
        <div className={`mt-4 inline-flex rounded-full px-3 py-1.5 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] sm:px-4 sm:py-2 sm:text-xs ${statusStyles[report.status]}`}>
          {report.status}
        </div>
        <p className="mt-4 max-w-2xl text-base font-semibold leading-6 text-asphalt/70 sm:mt-6 sm:text-2xl sm:leading-8">{body}</p>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-orange-500/25 bg-asphalt px-4 py-3 text-cream shadow-xl shadow-black/10 lg:hidden">
          <div>
            <div className="font-mono text-[0.58rem] font-black uppercase tracking-[0.22em] text-orange-200/75">Cone Index</div>
            <div className="text-4xl font-black leading-none tracking-[-0.08em]">{report.score}</div>
          </div>
          <div className={`rounded-full px-3 py-1.5 text-right font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] ${statusStyles[report.status]}`}>
            {report.status}
          </div>
        </div>
        <div className="mt-4 sm:mt-8">
          <StandingsStrip report={report} />
        </div>
      </div>
      <ConeMeter score={report.score} status={report.status} />
    </section>
  );
}

function MatchupCard({ game, mode }: { game: GameSummary | null; mode: PageMode }) {
  if (!game) return null;
  const label = mode === "pregame" ? "Next deployment" : "Upcoming deployment";
  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>{label}</Eyebrow>
          <h2 className="section-title mt-2">Pirates {game.side === "home" ? "vs" : "at"} {game.opponent}</h2>
          <p className="copy mt-3">{formatGameDate(game.date)} · {game.venue ?? "Venue TBD"}</p>
        </div>
        <div className="rounded-2xl bg-black px-4 py-3 text-right text-cream">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-orange-200/70">First pitch</div>
          <div className="mt-1 text-xl font-black">{formatShortFirstPitch(game.date)}</div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Mini label="Pirates starter" value={game.probablePiratesPitcher ?? "TBD"} />
        <Mini label="Opponent starter" value={game.probableOpponentPitcher ?? "TBD"} />
      </div>
    </section>
  );
}

function LiveGameCard({ report }: { report: ConeReport }) {
  const game = report.relevantGame;
  if (!game?.isLive) return null;
  return (
    <section className="panel !border-orange-400/30 !bg-asphalt text-cream">
      <Eyebrow>Live score</Eyebrow>
      <h2 className="mt-2 text-4xl font-black leading-none tracking-[-0.06em] text-cream sm:text-6xl">{scoreLine(game)}</h2>
      <p className="mt-3 text-base leading-7 text-cream/75">{game.inning ?? "Live"} · {game.venue ?? "Venue TBD"}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Mini label="Opponent" value={`${game.side === "home" ? "vs" : "at"} ${game.opponent}`} />
        <Mini label="Pirates starter" value={game.probablePiratesPitcher ?? "TBD"} />
        <Mini label="Status" value={game.status} />
      </div>
    </section>
  );
}

function LastResultCard({ report, compact = false }: { report: ConeReport; compact?: boolean }) {
  const game = report.recentGames[0];
  if (!game) return null;
  return (
    <section className="panel">
      <Eyebrow>{compact ? "Last result" : "Postgame cone report"}</Eyebrow>
      <h2 className="section-title mt-2">{scoreLine(game)}</h2>
      <p className="copy mt-3">{game.recap}</p>
      <div className={`mt-5 inline-flex rounded-full px-3 py-1.5 font-mono text-[0.65rem] font-black uppercase tracking-[0.15em] ${statusStyles[game.coneStatus]}`}>
        {game.coneStatus}
      </div>
    </section>
  );
}

function TrafficReport({ traffic, mode }: { traffic: TrafficMetrics | null; mode: PageMode }) {
  if (mode !== "live" && mode !== "postgame") {
    return (
      <section className="panel">
        <Eyebrow>Traffic report</Eyebrow>
        <h2 className="section-title mt-2">Conditions pending</h2>
        <p className="copy mt-3">Municipal baseball conditions open when there is game traffic to report.</p>
      </section>
    );
  }

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
      <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
        <div>
          <Eyebrow>Traffic report</Eyebrow>
          <h2 className="section-title mt-2">Municipal baseball conditions</h2>
        </div>
        <p className="max-w-sm text-xs leading-5 text-asphalt/60 sm:text-sm sm:leading-6">Runs, traffic, hazards. No filler when the road is closed.</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-4 lg:grid-cols-3">
        {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>
    </section>
  );
}

function RecentHoists({ report }: { report: ConeReport }) {
  return (
    <section className="panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Recent hoists</Eyebrow>
          <h2 className="section-title mt-2">Last five reports</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-asphalt/60">The always-on cone log. Season highs and deeper filters belong here next.</p>
      </div>
      <div className="mt-4 divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-white/45 sm:mt-6 sm:rounded-3xl">
        {report.recentGames.length === 0 ? (
          <p className="copy p-5">No completed games reached the traffic office.</p>
        ) : (
          report.recentGames.map((game) => (
            <article key={game.gamePk} className="grid gap-2 p-3.5 sm:gap-4 sm:p-5 md:grid-cols-[7rem_1fr_auto] md:items-center">
              <div className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-asphalt/55 sm:text-xs">{game.displayDate}</div>
              <div>
                <h3 className="font-bold text-asphalt">{scoreLine(game)}</h3>
                <p className="mt-1 text-xs leading-5 text-asphalt/65 sm:text-sm sm:leading-6">{game.recap}</p>
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
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
      <Mini label="Record" value={standings?.record ?? "—"} />
      <Mini label="Streak" value={standings?.streak ?? "—"} />
      <Mini label="Run diff" value={standings?.runDifferential == null ? "—" : `${standings.runDifferential > 0 ? "+" : ""}${standings.runDifferential}`} />
      <Mini label="WC back" value={standings?.wildCardGamesBack ?? "—"} />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-black/10 bg-white/35 px-2.5 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
      <div className="truncate font-mono text-[0.5rem] font-bold uppercase tracking-[0.14em] text-asphalt/50 sm:text-[0.62rem] sm:tracking-[0.2em]">{label}</div>
      <div className="mt-1 truncate text-sm font-bold leading-5 text-asphalt sm:text-sm">{value}</div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[0.64rem] font-black uppercase tracking-[0.22em] text-orange-600 sm:text-xs sm:tracking-[0.28em]">{children}</div>;
}

function LiveRefreshStrip({ report, mode, lastCheckedAt, refreshError }: { report: ConeReport; mode: PageMode; lastCheckedAt: string; refreshError: string | null }) {
  if (mode !== "live" && mode !== "pregame") return null;

  const game = mode === "live" ? report.relevantGame : report.nextGame;
  const score = game && game.piratesScore != null && game.opponentScore != null
    ? `Pirates ${game.piratesScore} · ${game.opponentAbbrev ?? game.opponent} ${game.opponentScore}`
    : game ? `First pitch ${formatShortFirstPitch(game.date)}` : "Schedule pending";

  return (
    <section className={`mb-5 rounded-[1.5rem] border px-4 py-3 shadow-xl shadow-black/10 sm:mb-6 sm:px-5 ${mode === "live" ? "border-orange-400/50 bg-asphalt text-cream" : "border-orange-500/25 bg-orange-500/10 text-asphalt"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`h-3 w-3 shrink-0 rounded-full ${mode === "live" ? "animate-pulse bg-orange-500 shadow-[0_0_18px_rgba(255,106,0,0.9)]" : "bg-orange-500"}`} />
          <div className="min-w-0">
            <div className={`font-mono text-[0.62rem] font-black uppercase tracking-[0.22em] ${mode === "live" ? "text-orange-200" : "text-orange-700"}`}>
              {mode === "live" ? "Live game control" : "Pregame watch"}
            </div>
            <div className="mt-1 truncate text-sm font-black sm:text-base">
              {mode === "live" ? `${score}${game?.inning ? ` · ${game.inning}` : ""}` : score}
            </div>
          </div>
        </div>
        <div className={`font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] ${mode === "live" ? "text-cream/65" : "text-asphalt/55"}`}>
          {refreshError ? "Refresh delayed" : `Auto-refresh ${mode === "live" ? "15s" : "60s"} · ${formatGeneratedAt(lastCheckedAt)} ET`}
        </div>
      </div>
    </section>
  );
}

export function LiveConeDashboard({ initialReport }: { initialReport: ConeReport }) {
  const [report, setReport] = useState(initialReport);
  const [lastCheckedAt, setLastCheckedAt] = useState(initialReport.generatedAt);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const mode = getPageMode(report);

  const refreshMs = useMemo(() => {
    if (mode === "live") return 15000;
    if (mode === "pregame") return 60000;
    return null;
  }, [mode]);

  useEffect(() => {
    if (!refreshMs) return;

    let cancelled = false;
    async function refresh() {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(`/api/cone-status?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`Refresh failed: ${response.status}`);
        const nextReport = (await response.json()) as ConeReport;
        if (!cancelled) {
          setReport(nextReport);
          setLastCheckedAt(nextReport.generatedAt);
          setRefreshError(null);
        }
      } catch (error) {
        if (!cancelled) setRefreshError(error instanceof Error ? error.message : "Refresh failed");
      }
    }

    const timer = window.setInterval(refresh, refreshMs);
    void refresh();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [refreshMs]);

  return (
    <main className="min-h-screen overflow-hidden bg-cream text-asphalt">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(18,16,13,0.04)_1px,transparent_1px),linear-gradient(rgba(18,16,13,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="relative mx-auto w-full max-w-7xl px-3.5 py-4 sm:px-8 sm:py-5 lg:px-10">
        <header className="flex items-center justify-between gap-3 rounded-[1.75rem] border border-black/10 bg-white/50 px-4 py-3 shadow-sm backdrop-blur sm:gap-4 sm:rounded-full sm:px-5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 shrink-0 cone-mini sm:h-9 sm:w-9" aria-hidden="true" />
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] sm:text-sm">Hoist the Cone</div>
              <div className="text-[0.68rem] font-semibold text-asphalt/55 sm:text-xs">Unofficial Buccos traffic desk</div>
            </div>
          </div>
          <div className="hidden font-mono text-xs font-bold uppercase tracking-[0.18em] text-asphalt/55 sm:block">Updated {formatGeneratedAt(lastCheckedAt)} ET</div>
        </header>

        <Hero report={report} mode={mode} />
        <LiveRefreshStrip report={report} mode={mode} lastCheckedAt={lastCheckedAt} refreshError={refreshError} />

        {mode === "live" ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <LiveGameCard report={report} />
            <TrafficReport traffic={report.traffic} mode={mode} />
          </div>
        ) : mode === "postgame" ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <TrafficReport traffic={report.traffic} mode={mode} />
            <MatchupCard game={report.nextGame} mode="idle" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.88fr]">
            <MatchupCard game={report.nextGame} mode={mode} />
            <LastResultCard report={report} compact />
          </div>
        )}

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
            <p className="copy mt-5">A dugout cone became a fan ritual. This is the unofficial traffic desk for the orange-plastic era.</p>
            <p className="copy mt-4">Baseball data, municipal seriousness, and exactly zero MLB endorsement.</p>
          </details>

          <section className="panel !border-orange-300/20 !bg-asphalt text-cream">
            <Eyebrow>How the index works</Eyebrow>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-cream">Deeply unofficial. Slightly strict.</h2>
            <p className="mt-4 text-base leading-7 text-cream/75">The Cone Index weighs game result, score margin, run production, homers, steals, pitching, streak, and residual congestion.</p>
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
