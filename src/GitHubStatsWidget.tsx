import React from "react";
import useGitHubStats from "./useGitHubStats";
import "./GitHubStatsWidget.css";

interface GitHubStatsWidgetProps {
  apiUrl: string;
  username?: string;
}

const MONTH_SHORT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DISPLAY_YEAR = 2026;

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

  const profileUsername = data.username || username || "";
  const profileName = data.displayName || profileUsername || "GitHub Profile";
  const avatarFallback = profileName.trim().charAt(0).toUpperCase() || "G";
  const stats = [
    { label: "Total Repositories", value: data.repositories.total },
    { label: "Total Commits", value: data.totalCommits },
    { label: "Pull Requests", value: data.totalPullRequests },
    { label: "Stars Earned", value: data.totalStars },
  ];
  const topLanguages = data.topLanguages.slice(0, 5);
  const contributionDays = data.contributions.weeks.flatMap((week) => week.days);
  const contributionMap = new Map(contributionDays.map((day) => [day.date, day]));
  const latestDay = contributionDays[contributionDays.length - 1];
  const latestDate = latestDay ? new Date(`${latestDay.date}T00:00:00Z`) : new Date();
  const yearStartDate = new Date(Date.UTC(DISPLAY_YEAR, 0, 1));
  const yearEndDate = new Date(Date.UTC(DISPLAY_YEAR, 11, 31));
  const yearStartGrid = new Date(yearStartDate);
  yearStartGrid.setUTCDate(yearStartGrid.getUTCDate() - yearStartGrid.getUTCDay());
  const yearEndGrid = new Date(yearEndDate);
  yearEndGrid.setUTCDate(yearEndGrid.getUTCDate() + (6 - yearEndGrid.getUTCDay()));
  const yearWeeks: Array<Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4; inYear: boolean; isFuture: boolean }>> = [];

  for (let cursor = new Date(yearStartGrid); cursor <= yearEndGrid; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
    const week = Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(cursor);
      dayDate.setUTCDate(cursor.getUTCDate() + index);
      const key = dayDate.toISOString().slice(0, 10);
      const existingDay = contributionMap.get(key);
      const inYear = dayDate >= yearStartDate && dayDate <= yearEndDate;
      const isFuture = dayDate > latestDate;

      return {
        date: key,
        count: existingDay?.count ?? 0,
        level: existingDay?.level ?? 0,
        inYear,
        isFuture,
      };
    });

    yearWeeks.push(week);
  }

  let previousMonthLabel = "";
  const monthLabels = yearWeeks.map((week) => {
    const firstDayInYear = week.find((day) => day.inYear);

    if (!firstDayInYear) {
      return "";
    }

    const date = new Date(`${firstDayInYear.date}T00:00:00Z`);
    const label = MONTH_SHORT_FORMATTER.format(date);

    if (label === previousMonthLabel) {
      return "";
    }

    previousMonthLabel = label;
    return label;
  });

  return (
    <div className="gsw-root">
      <div className="gsw-layout">
        <div className="gsw-left">
          <div className="gsw-profile">
            {data.avatarUrl ? (
              <img
                className="gsw-avatar"
                src={data.avatarUrl}
                alt={`${profileName} avatar`}
              />
            ) : (
              <div className="gsw-avatar gsw-avatar-fallback" aria-hidden="true">
                {avatarFallback}
              </div>
            )}
            <div className="gsw-profile-copy">
              <p className="gsw-display-name">{profileName}</p>
              {profileUsername && <p className="gsw-username">@{profileUsername}</p>}
            </div>
          </div>

          <div className="gsw-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="gsw-stat-row">
                <span className="gsw-stat-label">{stat.label}</span>
                <span className="gsw-stat-value">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gsw-right">
          <div className="gsw-heatmap-header">
            <p className="gsw-heatmap-heading">2026 Contributions</p>
            <p className="gsw-heatmap-label">
              {`${data.contributions.total} contributions in ${DISPLAY_YEAR}`}
            </p>
          </div>
          <div className="gsw-heatmap-scroll">
            <div className="gsw-heatmap-github">
              <div className="gsw-heatmap-months">
                <div className="gsw-heatmap-corner" />
                <div className="gsw-heatmap-month-row">
                  {monthLabels.map((label, index) => (
                    <span key={`${label}-${index}`} className="gsw-heatmap-month-label">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="gsw-heatmap-body">
                <div className="gsw-heatmap-weekdays">
                  {WEEKDAY_LABELS.map((label) => (
                    <span key={label} className="gsw-heatmap-weekday-label">
                      {label}
                    </span>
                  ))}
                </div>
                <div className="gsw-heatmap-week-columns">
                  {yearWeeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="gsw-heatmap-week-column">
                      {week.map((day) => {
                        return (
                          <div
                            key={day.date}
                            className={`gsw-heatmap-cell ${day.inYear ? `gsw-level-${day.level}` : "gsw-level-0"} ${
                              day.inYear && !day.isFuture ? "" : "gsw-heatmap-cell-muted"
                            }`}
                            title={`${day.date}: ${day.count} contributions`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {topLanguages.length > 0 && (
            <div className="gsw-languages">
              <div className="gsw-languages-header">
                <p className="gsw-languages-heading">Top Languages</p>
                <p className="gsw-languages-label">By public repository code volume</p>
              </div>
              <div className="gsw-language-list">
                {topLanguages.map((language) => (
                  <div key={language.name} className="gsw-language-row">
                    <div className="gsw-language-meta">
                      <span
                        className="gsw-language-dot"
                        style={{ backgroundColor: language.color }}
                      />
                      <span className="gsw-language-name">{language.name}</span>
                      <span className="gsw-language-value">{language.percentage}%</span>
                    </div>
                    <div className="gsw-language-bar">
                      <div
                        className="gsw-language-bar-fill"
                        style={{
                          width: `${language.percentage}%`,
                          backgroundColor: language.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubStatsWidget;
