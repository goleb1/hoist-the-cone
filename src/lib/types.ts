export type ConeStatus =
  | "FULL HOIST"
  | "CONE UP"
  | "CONE WATCH"
  | "PARTIAL HOIST"
  | "CONE DOWN"
  | "CONE IN STORAGE";

export type RelevantGameState = "live" | "scheduled" | "final" | "offday" | "error";
export type PageMode = "live" | "pregame" | "postgame" | "idle" | "error";

export type TeamSide = "home" | "away";

export type GameSummary = {
  gamePk: number;
  date: string;
  displayDate: string;
  opponent: string;
  opponentAbbrev?: string;
  venue?: string;
  side: TeamSide;
  status: string;
  abstractState: string;
  isFinal: boolean;
  isLive: boolean;
  isScheduled: boolean;
  piratesScore: number | null;
  opponentScore: number | null;
  inning?: string;
  probablePiratesPitcher?: string;
  probableOpponentPitcher?: string;
  linescore?: {
    balls?: number;
    strikes?: number;
    outs?: number;
    inningHalf?: string;
  };
};

export type TrafficMetrics = {
  runs: number | null;
  hits: number | null;
  walks: number | null;
  leftOnBase: number | null;
  homeRuns: number | null;
  stolenBases: number | null;
  pitcherStrikeouts: number | null;
  errors: number | null;
};

export type StandingsSummary = {
  record: string;
  pct: string;
  streak: string;
  runDifferential: number | null;
  divisionRank?: string;
  wildCardGamesBack?: string;
};

export type ConeReport = {
  generatedAt: string;
  state: RelevantGameState;
  score: number;
  status: ConeStatus;
  headline: string;
  explanation: string;
  relevantGame: GameSummary | null;
  nextGame: GameSummary | null;
  traffic: TrafficMetrics | null;
  standings: StandingsSummary | null;
  recentGames: Array<GameSummary & { coneScore: number; coneStatus: ConeStatus; recap: string }>;
  dataFreshness: string;
  error?: string;
};
