import type { ConeReport, ConeStatus, GameSummary, StandingsSummary, TrafficMetrics } from "./types";

const PIRATES_ID = 134;
const NL_ID = 104;
const MLB_BASE = "https://statsapi.mlb.com/api/v1";

type MlbTeam = { id: number; name: string; abbreviation?: string };
type MlbGameTeam = {
  score?: number;
  team: MlbTeam;
  probablePitcher?: { fullName: string };
};
type MlbGame = {
  gamePk: number;
  gameDate: string;
  venue?: { name: string };
  status: { abstractGameState: string; detailedState: string };
  teams: { away: MlbGameTeam; home: MlbGameTeam };
  linescore?: {
    currentInningOrdinal?: string;
    inningHalf?: string;
    balls?: number;
    strikes?: number;
    outs?: number;
  };
};
type ScheduleResponse = { dates?: Array<{ date: string; games: MlbGame[] }> };
type StandingsResponse = {
  records?: Array<{
    teamRecords?: Array<{
      team: MlbTeam;
      streak?: { streakCode?: string };
      divisionRank?: string;
      wildCardGamesBack?: string;
      leagueRecord?: { wins: number; losses: number; pct: string };
      runDifferential?: number;
    }>;
  }>;
};
type BoxscoreResponse = {
  teams?: {
    away?: BoxscoreTeam;
    home?: BoxscoreTeam;
  };
};
type BoxscoreTeam = {
  teamStats?: {
    batting?: Record<string, string | number>;
    pitching?: Record<string, string | number>;
  };
  errors?: number;
};

function etDate(offsetDays = 0) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000));
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateIso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  }).format(new Date(dateIso));
}

function formatFirstPitch(dateIso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateIso));
}

async function fetchJson<T>(url: string, revalidate = 60): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate },
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`MLB API ${response.status}: ${url}`);
  }

  return response.json() as Promise<T>;
}

function flattenGames(schedule: ScheduleResponse) {
  return (schedule.dates ?? []).flatMap((date) => date.games ?? []);
}

function normalizeGame(game: MlbGame): GameSummary {
  const piratesSide = game.teams.home.team.id === PIRATES_ID ? "home" : "away";
  const pirates = game.teams[piratesSide];
  const opponentSide = piratesSide === "home" ? "away" : "home";
  const opponent = game.teams[opponentSide];
  const abstract = game.status.abstractGameState;

  return {
    gamePk: game.gamePk,
    date: game.gameDate,
    displayDate: formatDisplayDate(game.gameDate),
    opponent: opponent.team.name,
    opponentAbbrev: opponent.team.abbreviation,
    venue: game.venue?.name,
    side: piratesSide,
    status: game.status.detailedState,
    abstractState: abstract,
    isFinal: abstract === "Final" || game.status.detailedState === "Final",
    isLive: abstract === "Live",
    isScheduled: abstract === "Preview" || abstract === "Preview" || game.status.detailedState === "Scheduled",
    piratesScore: typeof pirates.score === "number" ? pirates.score : null,
    opponentScore: typeof opponent.score === "number" ? opponent.score : null,
    inning: abstract === "Live" && game.linescore?.currentInningOrdinal
      ? `${game.linescore.inningHalf ?? ""} ${game.linescore.currentInningOrdinal}`.trim()
      : undefined,
    probablePiratesPitcher: pirates.probablePitcher?.fullName,
    probableOpponentPitcher: opponent.probablePitcher?.fullName,
    linescore: game.linescore
      ? {
          balls: game.linescore.balls,
          strikes: game.linescore.strikes,
          outs: game.linescore.outs,
          inningHalf: game.linescore.inningHalf,
        }
      : undefined,
  };
}

function pickRelevantGame(games: GameSummary[]) {
  const today = etDate();
  const todayGames = games.filter((game) => game.date.slice(0, 10) === today);

  return (
    todayGames.find((game) => game.isLive) ??
    todayGames.find((game) => game.isScheduled) ??
    todayGames.find((game) => game.isFinal) ??
    [...games].reverse().find((game) => game.isFinal) ??
    games.find((game) => game.isScheduled) ??
    null
  );
}

function pickNextGame(games: GameSummary[]) {
  const now = Date.now();
  return games.find((game) => game.isScheduled && Date.parse(game.date) > now - 30 * 60 * 1000) ?? null;
}

async function getTrafficMetrics(game: GameSummary | null): Promise<TrafficMetrics | null> {
  if (!game || game.isScheduled) return null;

  try {
    const boxscore = await fetchJson<BoxscoreResponse>(`${MLB_BASE}/game/${game.gamePk}/boxscore`, game.isLive ? 15 : 3600);
    const piratesSide = game.side;
    const team = boxscore.teams?.[piratesSide];
    const batting = team?.teamStats?.batting ?? {};
    const pitching = team?.teamStats?.pitching ?? {};

    return {
      runs: numberish(batting.runs ?? game.piratesScore),
      hits: numberish(batting.hits),
      walks: numberish(batting.baseOnBalls),
      leftOnBase: numberish(batting.leftOnBase),
      homeRuns: numberish(batting.homeRuns),
      stolenBases: numberish(batting.stolenBases),
      pitcherStrikeouts: numberish(pitching.strikeOuts),
      errors: numberish(team?.errors),
    };
  } catch {
    return {
      runs: game.piratesScore,
      hits: null,
      walks: null,
      leftOnBase: null,
      homeRuns: null,
      stolenBases: null,
      pitcherStrikeouts: null,
      errors: null,
    };
  }
}

function numberish(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

async function getStandings(): Promise<StandingsSummary | null> {
  try {
    const standings = await fetchJson<StandingsResponse>(`${MLB_BASE}/standings?leagueId=${NL_ID}&season=${etDate().slice(0, 4)}&standingsTypes=regularSeason`, 900);
    const pirates = standings.records
      ?.flatMap((record) => record.teamRecords ?? [])
      .find((team) => team.team.id === PIRATES_ID);

    if (!pirates?.leagueRecord) return null;

    return {
      record: `${pirates.leagueRecord.wins}-${pirates.leagueRecord.losses}`,
      pct: pirates.leagueRecord.pct,
      streak: pirates.streak?.streakCode ?? "—",
      runDifferential: typeof pirates.runDifferential === "number" ? pirates.runDifferential : null,
      divisionRank: pirates.divisionRank,
      wildCardGamesBack: pirates.wildCardGamesBack,
    };
  } catch {
    return null;
  }
}

function scoreGame(game: GameSummary | null, traffic: TrafficMetrics | null, standings: StandingsSummary | null) {
  if (!game) return 0;

  let score = 42;
  const piratesScore = game.piratesScore ?? 0;
  const opponentScore = game.opponentScore ?? 0;
  const differential = piratesScore - opponentScore;

  if (game.isLive) score = differential > 0 ? 55 : differential === 0 ? 45 : 30;
  else if (game.isScheduled) score = 42;
  else if (game.isFinal) score = differential > 0 ? 60 : 20;

  if (game.isFinal || game.isLive) {
    if (differential >= 5) score += 15;
    else if (differential >= 3) score += 10;
    else if (differential >= 1) score += 5;
    else if (differential <= -5) score -= 10;

    if (piratesScore >= 8) score += 12;
    else if (piratesScore >= 5) score += 7;
    else if (piratesScore <= 1) score -= 10;

    if (opponentScore <= 2 && differential > 0) score += 8;
    if (opponentScore >= 7) score -= 8;
  }

  if ((traffic?.homeRuns ?? 0) >= 2) score += 8;
  else if ((traffic?.homeRuns ?? 0) === 1) score += 4;
  if ((traffic?.stolenBases ?? 0) >= 2) score += 5;
  if ((traffic?.pitcherStrikeouts ?? 0) >= 10) score += 4;
  if ((traffic?.leftOnBase ?? 0) >= 10 && piratesScore < 5) score -= 5;

  if (standings?.streak?.startsWith("W")) {
    const streak = Number(standings.streak.slice(1));
    if (streak >= 2) score += 5;
  }
  if (standings?.streak?.startsWith("L")) {
    const streak = Number(standings.streak.slice(1));
    if (streak >= 2) score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

function statusFromScore(score: number): ConeStatus {
  if (score >= 80) return "FULL HOIST";
  if (score >= 60) return "CONE UP";
  if (score >= 40) return "CONE WATCH";
  if (score >= 25) return "PARTIAL HOIST";
  if (score >= 1) return "CONE DOWN";
  return "CONE IN STORAGE";
}

function makeHeadline(status: ConeStatus, game: GameSummary | null) {
  if (!game) return "Cone staged, signal unavailable";
  if (game.isScheduled) return "Cone staged for first pitch";
  if (game.isLive) return (game.piratesScore ?? 0) > (game.opponentScore ?? 0) ? "Active hoist conditions" : "Cone watch in progress";
  if ((game.piratesScore ?? 0) > (game.opponentScore ?? 0)) {
    return status === "FULL HOIST" ? "Full hoist authorized" : "Cone up after a Pirates win";
  }
  return status === "CONE IN STORAGE" ? "Cone returned to storage" : "Cone lowered pending review";
}

function makeExplanation(status: ConeStatus, game: GameSummary | null, traffic: TrafficMetrics | null) {
  if (!game) return "The traffic office could not reach the MLB feed. Cone status is temporarily manual.";
  if (game.isScheduled) {
    return `${game.side === "home" ? "Home" : "Road"} traffic against ${game.opponent} begins ${formatFirstPitch(game.date)}. Cone staged near the dugout.`;
  }

  const piratesScore = game.piratesScore ?? 0;
  const opponentScore = game.opponentScore ?? 0;
  const result = `${piratesScore}-${opponentScore}`;

  if (game.isLive) {
    if (piratesScore > opponentScore) return `Pirates lead ${result}. Traffic is moving, but the cone office is not issuing final permits yet.`;
    if (piratesScore === opponentScore) return `Pirates and ${game.opponent} are tied ${result}. Cone watch remains active.`;
    return `Pirates trail ${result}. Traffic backed up, but lanes remain technically open.`;
  }

  if (piratesScore > opponentScore) {
    if (status === "FULL HOIST") return `Pirates beat ${game.opponent} ${result}. Traffic cleared with authority. Cone deployment authorized.`;
    return `Pirates beat ${game.opponent} ${result}. Not a masterpiece, but the lane reopened. Cone up.`;
  }

  if ((traffic?.runs ?? piratesScore) >= 5) {
    return `Pirates lost ${result}, despite moving traffic. The cone does not reward theoretical runs.`;
  }
  return `Pirates lost ${result}. Traffic backed up. Cone lowered pending further review.`;
}

function recapGame(game: GameSummary, score: number) {
  const piratesScore = game.piratesScore ?? 0;
  const opponentScore = game.opponentScore ?? 0;
  const result = `Pirates ${piratesScore}, ${game.opponent} ${opponentScore}`;

  if (piratesScore > opponentScore) {
    if (score >= 80) return `${result}. Traffic cleared, cone elevated, paperwork approved.`;
    return `${result}. Road reopened. Cone up.`;
  }
  if (piratesScore >= 5) return `${result}. Traffic moved, outcome did not. Cone down.`;
  return `${result}. Delays reported. Cone lowered.`;
}

export async function getConeReport(): Promise<ConeReport> {
  const generatedAt = new Date().toISOString();

  try {
    const startDate = etDate(-12);
    const endDate = etDate(7);
    const schedule = await fetchJson<ScheduleResponse>(
      `${MLB_BASE}/schedule?sportId=1&teamId=${PIRATES_ID}&startDate=${startDate}&endDate=${endDate}&hydrate=probablePitcher,linescore,team`,
      15,
    );

    const games = flattenGames(schedule).map(normalizeGame).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    const relevantGame = pickRelevantGame(games);
    const nextGame = pickNextGame(games);
    const [traffic, standings] = await Promise.all([getTrafficMetrics(relevantGame), getStandings()]);
    const score = scoreGame(relevantGame, traffic, standings);
    const status = statusFromScore(score);
    const recentGames = games
      .filter((game) => game.isFinal)
      .slice(-5)
      .reverse()
      .map((game) => {
        const gameScore = scoreGame(game, null, standings);
        const gameStatus = statusFromScore(gameScore);
        return { ...game, coneScore: gameScore, coneStatus: gameStatus, recap: recapGame(game, gameScore) };
      });

    return {
      generatedAt,
      state: relevantGame?.isLive ? "live" : relevantGame?.isScheduled ? "scheduled" : relevantGame?.isFinal ? "final" : "offday",
      score,
      status,
      headline: makeHeadline(status, relevantGame),
      explanation: makeExplanation(status, relevantGame, traffic),
      relevantGame,
      nextGame,
      traffic,
      standings,
      recentGames,
      dataFreshness: relevantGame?.isLive ? "Live feed auto-refreshes every 15 seconds while this page is open." : "Game data refreshes periodically from MLB Stats API.",
    };
  } catch (error) {
    return {
      generatedAt,
      state: "error",
      score: 0,
      status: "CONE IN STORAGE",
      headline: "Cone signal interrupted",
      explanation: "The traffic office could not reach the MLB feed. Please remain calm and keep cones legally acquired.",
      relevantGame: null,
      nextGame: null,
      traffic: null,
      standings: null,
      recentGames: [],
      dataFreshness: "Data feed unavailable.",
      error: error instanceof Error ? error.message : "Unknown MLB API error",
    };
  }
}
