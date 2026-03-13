import { useState, useEffect } from "react";
import { GitHubStatsResponse } from "./types";

interface UseGitHubStatsResult {
  data: GitHubStatsResponse | null;
  loading: boolean;
  error: string | null;
}

const useGitHubStats = (apiUrl: string): UseGitHubStatsResult => {
  const [data, setData] = useState<GitHubStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const json = await response.json() as GitHubStatsResponse;
        setData(json);
      } catch (err: any) {
        setError(err.message ?? "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [apiUrl]);

  return { data, loading, error };
};

export default useGitHubStats;