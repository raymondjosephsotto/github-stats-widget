import React from "react";
import useGitHubStats from "./useGitHubStats";
import "./GitHubStatsWidget.css";

interface GitHubStatsWidgetProps {
  apiUrl: string;
  username?: string;
}

const GitHubStatsWidget: React.FC<GitHubStatsWidgetProps> = ({ apiUrl, username }) => {
  const { data, loading, error } = useGitHubStats(apiUrl);

  if (loading) {
    return (
      <div className="gsw-root">
        <div className="gsw-skeleton">
          <div className="gsw-skeleton-cards">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="gsw-skeleton-card gsw-pulse" />
            ))}
          </div>
          <div className="gsw-skeleton-heatmap gsw-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  const statCards = [
    { label: "Repositories", value: data.totalRepos },
    { label: "Stars Earned", value: data.totalStars },
    { label: "Commits This Year", value: data.commitsThisYear },
    { label: "Top Language", value: data.topLanguages[0]?.name ?? "—" },
  ];

  return (
    <div className="gsw-root">
      {username && <p className="gsw-username">@{username}</p>}

      <div className="gsw-layout">

        {/* Left — stat cards + language bars */}
        <div className="gsw-left">
          <div className="gsw-cards">
            {statCards.map((card) => (
              <div key={card.label} className="gsw-card">
                <div className="gsw-card-value">{card.value}</div>
                <div className="gsw-card-label">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="gsw-languages">
            {data.topLanguages.map((lang) => (
              <div key={lang.name} className="gsw-lang-row">
                <div className="gsw-lang-meta">
                  <span
                    className="gsw-lang-dot"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span className="gsw-lang-name">{lang.name}</span>
                  <span className="gsw-lang-pct">{lang.percentage}%</span>
                </div>
                <div className="gsw-lang-bar-track">
                  <div
                    className="gsw-lang-bar-fill"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — contribution heatmap */}
        <div className="gsw-right">
          <p className="gsw-heatmap-label">
            {data.contributions.total} contributions in the last year
          </p>
          <div className="gsw-heatmap">
            {data.contributions.weeks.map((week, wi) => (
              <div key={wi} className="gsw-heatmap-col">
                {week.days.map((day) => (
                  <div
                    key={day.date}
                    className={`gsw-heatmap-cell gsw-level-${day.level}`}
                    title={`${day.date}: ${day.count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GitHubStatsWidget;