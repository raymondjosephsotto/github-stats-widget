export interface Language {
  name: string;
  color: string;
  percentage: number;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface GitHubStatsResponse {
  totalRepos: number;
  totalStars: number;
  commitsThisYear: number;
  topLanguages: Language[];
  contributions: {
    total: number;
    weeks: ContributionWeek[];
  };
}