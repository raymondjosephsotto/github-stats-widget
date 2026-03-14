export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface RepositoryStats {
  contributedTo: number;
  total: number;
}

export interface LanguageStat {
  name: string;
  color: string;
  percentage: number;
}

export interface GitHubStatsApiResponse {
  avatarUrl?: string;
  avatar_url?: string;
  displayName?: string;
  name?: string;
  username?: string;
  login?: string;
  profile?: {
    avatarUrl?: string;
    avatar_url?: string;
    displayName?: string;
    name?: string;
    username?: string;
    login?: string;
  };
  repositories?: Partial<RepositoryStats>;
  totalCommits?: number;
  totalPullRequests?: number;
  totalStars?: number;
  totalRepos?: number;
  commitsThisYear?: number;
  topLanguages?: LanguageStat[];
  contributions?: {
    total?: number;
    weeks?: ContributionWeek[];
  };
}

export interface GitHubStatsResponse {
  avatarUrl: string;
  displayName: string;
  username: string;
  repositories: RepositoryStats;
  totalCommits: number;
  totalPullRequests: number;
  totalStars: number;
  topLanguages: LanguageStat[];
  contributions: {
    total: number;
    weeks: ContributionWeek[];
  };
}
