import { apiGet } from "./api";

export type TournamentDataType = 1 | 2 | 3;

export type TournamentMatrixTeam = {
  id: number;
  place: number;
  name: string;
  games: number;
  points: number;
  wins: number;
  otWins: number;
  otLosses: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  diff: number;
};

export type TournamentMatrixMatch = {
  teamId: number;
  opponentId: number;
  score: string;
  order: number;
};

export type TournamentMatrix = {
  teams: TournamentMatrixTeam[];
  matches: TournamentMatrixMatch[];
  showAwayMatches: boolean;
};

export type TournamentCupMatch = {
  TeamName1: string;
  TeamID1: number;
  TeamName2: string;
  TeamID2: number;
  Score: string;
  Date: string;
  stage: string;
};

export type TournamentPlainText = {
  plaintext: string;
};

export type TournamentResponse =
  | {
      status: "OK";
      datatype: 1;
      list: TournamentMatrix[];
    }
  | {
      status: "OK";
      datatype: 2;
      list: TournamentCupMatch[];
    }
  | {
      status: "OK";
      datatype: 3;
      list: TournamentPlainText[];
    };

export async function getTournament(id: number): Promise<TournamentResponse> {
  return apiGet<TournamentResponse>(`/tournament?id=${id}`);
}

