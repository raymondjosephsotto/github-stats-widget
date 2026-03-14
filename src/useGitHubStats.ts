import { useState, useEffect } from "react";
import { GitHubStatsApiResponse, GitHubStatsResponse } from "./types";

interface UseGitHubStatsResult {
  data: GitHubStatsResponse | null;
  loading: boolean;
  error: string | null;
}

const normalizeGitHubStats = (payload: GitHubStatsApiResponse): GitHubStatsResponse => {
  const profile = payload.profile ?? {};
  const avatarUrl = payload.avatarUrl ?? payload.avatar_url ?? profile.avatarUrl ?? profile.avatar_url ?? "";
  const username = payload.username ?? payload.login ?? profile.username ?? profile.login ?? "";
  const displayName =
    payload.displayName ?? payload.name ?? profile.displayName ?? profile.name ?? username;

  return {
    avatarUrl,
    displayName,
    username,
    repositories: {
      contributedTo: payload.repositories?.contributedTo ?? payload.totalRepos ?? 0,
      total: payload.repositories?.total ?? payload.totalRepos ?? 0,
    },
    totalCommits: payload.totalCommits ?? payload.commitsThisYear ?? 0,
    totalPullRequests: payload.totalPullRequests ?? 0,
    totalStars: payload.totalStars ?? 0,
    topLanguages: payload.topLanguages ?? [],
    contributions: {
      total: payload.contributions?.total ?? 0,
      weeks: payload.contributions?.weeks ?? [],
    },
  };
};

const useGitHubStats = (apiUrl: string): UseGitHubStatsResult => {
  const [data, setData] = useState<GitHubStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(apiUrl, { signal: controller.signal });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const json = await response.json() as GitHubStatsApiResponse;
        setData(normalizeGitHubStats(json));
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        const message = err instanceof Error ? err.message : "Failed to fetch stats";
        setError(message);
        setData(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => controller.abort();
  }, [apiUrl]);

  return { data, loading, error };
};

export default useGitHubStats;
