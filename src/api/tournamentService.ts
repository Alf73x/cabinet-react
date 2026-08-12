import { apiGet } from "./api";

export type TournamentDataType = 1 | 2 | 3;

export type TournamentTeamStat = {
  games: number;
  points: number;
  wins: number;
  otWins: number;
  draws: number;
  otLosses: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  diff: number;
};

export type TournamentMatrixTeam = {
  id: number;
  place: number;
  stageIndex: number;
  resultIndex: number;
  resultIndex2: number;
  name: string;
  games: number;
  points: number;
  wins: number;
  otWins: number;
  draws: number;
  otLosses: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  diff: number;
  
  home: TournamentTeamStat;
  away: TournamentTeamStat;  
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
  viewMode?: string;
};

export type TournamentCupMatch = {
  teamName1: string;
  teamId1: number;
  teamName2: string;
  teamId2: number;
  score: string;
  date: string;
  stageIndex: number;
};


export type TournamentPlainText = {
  plainText: string;
};


export type TournamentPoints = {
  win: number;
  winEt: number;
  draw: number;
  lossEt: number;
  loss: number;
  na: number;
};

export type TournamentResponse =
  | {
      status: "OK";
      datatype: 1;
      tableFormat: number;
      resultOf: number;
      points: TournamentPoints;
      roundStandings?: string;
      infoText: string;
      commentText: string;
      list: TournamentMatrix[];
    }
  | {
      status: "OK";
      datatype: 2;
      infoText: string;
      commentText: string;
      list: TournamentCupMatch[];
    }
  | {
      status: "OK";
      datatype: 3;
      infoText: string;
      commentText: string;
      list: TournamentPlainText[];
    };

export async function getTournament(id: number): Promise<TournamentResponse> {
  return apiGet<TournamentResponse>(`/tournament?id=${id}`);
}

