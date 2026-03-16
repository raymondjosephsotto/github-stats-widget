import React, { useEffect, useRef, useState } from "react";
import useGitHubStats from "./useGitHubStats";
import "./GitHubStatsWidget.css";

interface GitHubStatsWidgetProps {
  apiUrl: string;
  username?: string;
}

interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  inYear: boolean;
  isFuture: boolean;
}

const MONTH_SHORT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DISPLAY_YEAR = new Date().getFullYear();
const HEATMAP_GAP = 2;
const YEAR_START_DATE = new Date(Date.UTC(DISPLAY_YEAR, 0, 1));
const YEAR_END_DATE = new Date(Date.UTC(DISPLAY_YEAR, 11, 31));
const YEAR_START_GRID = new Date(YEAR_START_DATE);
YEAR_START_GRID.setUTCDate(YEAR_START_GRID.getUTCDate() - YEAR_START_GRID.getUTCDay());
const YEAR_END_GRID = new Date(YEAR_END_DATE);
YEAR_END_GRID.setUTCDate(YEAR_END_GRID.getUTCDate() + (6 - YEAR_END_GRID.getUTCDay()));
const YEAR_WEEK_COUNT =
  Math.round((YEAR_END_GRID.getTime() - YEAR_START_GRID.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
const WIDGET_REPO_URL = "https://github.com/raymondjosephsotto/github-stats-widget";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const RepositoryIcon = () => (
  <svg aria-hidden="true" className="gsw-stat-icon" {...iconProps}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5A2.5 2.5 0 0 0 17.5 16H4z" />
    <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V16" />
  </svg>
);

const CommitIcon = () => (
  <svg aria-hidden="true" className="gsw-stat-icon" {...iconProps}>
    <circle cx="12" cy="12" r="3" />
    <path d="M3 12h6M15 12h6" />
  </svg>
);

const PullRequestIcon = () => (
  <svg aria-hidden="true" className="gsw-stat-icon" {...iconProps}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="19" r="3" />
    <circle cx="6" cy="5" r="3" />
    <path d="M9 5h4a5 5 0 0 1 5 5v2" />
    <path d="M6 8v8" />
  </svg>
);

const StarIcon = () => (
  <svg aria-hidden="true" className="gsw-stat-icon" {...iconProps}>
    <path d="m12 3 2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.77 6.2 20.87l1.11-6.47-4.7-4.58 6.49-.94z" />
  </svg>
);

const LinkIcon = () => (
  <svg aria-hidden="true" className="gsw-stat-icon" {...iconProps}>
    <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13" />
    <path d="M14 11a5 5 0 0 1 0 7l-1.5 1.5a5 5 0 0 1-7-7L7 11" />
  </svg>
);

const parseUtcDate = (value: string) => new Date(`${value}T00:00:00Z`);

const buildYearWeeks = (
  contributionMap: Map<string, { count: number; level: 0 | 1 | 2 | 3 | 4 }>,
  latestDate: Date,
) => {
  const weeks: HeatmapDay[][] = [];

  for (let cursor = new Date(YEAR_START_GRID); cursor <= YEAR_END_GRID; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
    const week = Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(cursor);
      dayDate.setUTCDate(cursor.getUTCDate() + index);
      const key = dayDate.toISOString().slice(0, 10);
      const existingDay = contributionMap.get(key);

      return {
        date: key,
        count: existingDay?.count ?? 0,
        level: existingDay?.level ?? 0,
        inYear: dayDate >= YEAR_START_DATE && dayDate <= YEAR_END_DATE,
        isFuture: dayDate > latestDate,
      };
    });

    weeks.push(week);
  }

  return weeks;
};

const buildMonthLabels = (yearWeeks: HeatmapDay[][]) => {
  let previousMonthLabel = "";

  return yearWeeks.map((week) => {
    const firstDayInYear = week.find((day) => day.inYear);

    if (!firstDayInYear) {
      return "";
    }

    const label = MONTH_SHORT_FORMATTER.format(parseUtcDate(firstDayInYear.date));

    if (label === previousMonthLabel) {
      return "";
    }

    previousMonthLabel = label;
    return label;
  });
};

const GitHubStatsWidget: React.FC<GitHubStatsWidgetProps> = ({ apiUrl, username }) => {
  const { data, loading, error } = useGitHubStats(apiUrl);
  const weekColumnsRef = useRef<HTMLDivElement | null>(null);
  const [cellSize, setCellSize] = useState(8);

  useEffect(() => {
    const element = weekColumnsRef.current;
    if (!element || loading || error || !data) {
      return;
    }

    const updateCellSize = () => {
      const width = element.clientWidth;

      if (!width) {
        return;
      }

      const nextCellSize = Math.max(
        6,
        Math.floor((width - HEATMAP_GAP * (YEAR_WEEK_COUNT - 1)) / YEAR_WEEK_COUNT),
      );

      setCellSize(nextCellSize);
    };

    updateCellSize();

    const observer = new ResizeObserver(updateCellSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [data, error, loading]);

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
  const profileUrl = profileUsername ? `https://github.com/${profileUsername}` : undefined;
  const profileName = data.displayName || profileUsername || "GitHub Profile";
  const avatarFallback = profileName.trim().charAt(0).toUpperCase() || "G";
  const stats = [
    { label: "Total Repositories", value: data.repositories.total, icon: <RepositoryIcon /> },
    { label: "Total Commits", value: data.totalCommits, icon: <CommitIcon /> },
    { label: "Pull Requests", value: data.totalPullRequests, icon: <PullRequestIcon /> },
    { label: "Stars Earned", value: data.totalStars, icon: <StarIcon /> },
  ];
  const topLanguages = data.topLanguages.slice(0, 5);
  const contributionDays = data.contributions.weeks.flatMap((week) => week.days);
  const contributionMap = new Map(contributionDays.map((day) => [day.date, day]));
  const latestDay = contributionDays[contributionDays.length - 1];
  const latestDate = latestDay ? parseUtcDate(latestDay.date) : new Date();
  const yearWeeks = buildYearWeeks(contributionMap, latestDate);
  const monthLabels = buildMonthLabels(yearWeeks);

  const heatmapStyle = {
    "--gsw-cell-size": `${cellSize}px`,
    "--gsw-cell-gap": `${HEATMAP_GAP}px`,
  } as React.CSSProperties;
  const heatmapColumnsStyle = {
    gridTemplateColumns: `repeat(${yearWeeks.length}, ${cellSize}px)`,
  } as React.CSSProperties;

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
              {profileUsername && (
                <a
                  className="gsw-username"
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{profileUsername}
                </a>
              )}
            </div>
          </div>

          <div className="gsw-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="gsw-stat-row">
                <span className="gsw-stat-label">
                  {stat.icon}
                  {stat.label}
                </span>
                <span className="gsw-stat-value">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="gsw-widget-callout">
            <div className="gsw-widget-callout-title">
              <LinkIcon />
              <span>Custom GitHub Widget</span>
            </div>
            <p className="gsw-widget-callout-copy">
              This custom widget was created to showcase live GitHub activity with a reusable,
              responsive layout for profile metadata, contribution history, and top languages.
              {" "}
              <a
                className="gsw-widget-callout-link"
                href={WIDGET_REPO_URL}
                target="_blank"
                rel="noreferrer"
              >
                View github-stats-widget on GitHub
              </a>
              {" "}
              to explore the code, connect it to
              {" "}
              <code>github-stats-api</code>
              {" "}
              and add it to your own website.
            </p>
          </div>
        </div>

        <div className="gsw-right">
          <div className="gsw-heatmap-header">
            <p className="gsw-heatmap-heading">{DISPLAY_YEAR} Contributions</p>
            <p className="gsw-heatmap-label">
              {`${data.contributions.total} contributions in ${DISPLAY_YEAR}`}
            </p>
          </div>
          <div className="gsw-heatmap-scroll">
            <div className="gsw-heatmap-github" style={heatmapStyle}>
              <div className="gsw-heatmap-months">
                <div className="gsw-heatmap-corner" />
                <div
                  className="gsw-heatmap-month-row"
                  style={heatmapColumnsStyle}
                >
                  {monthLabels.map((label, index) => (
                    <span key={`${label}-${index}`} className="gsw-heatmap-month-label">
                      {label && <span className="gsw-heatmap-month-label-text">{label}</span>}
                    </span>
                  ))}
                </div>
              </div>
              <div className="gsw-heatmap-body">
                <div className="gsw-heatmap-weekdays">
                  {WEEKDAY_LABELS.map((label) => (
                    <span key={label} className="gsw-heatmap-weekday-label">
                      <span className="gsw-heatmap-weekday-label-text">{label}</span>
                    </span>
                  ))}
                </div>
                <div
                  ref={weekColumnsRef}
                  className="gsw-heatmap-week-columns"
                  style={heatmapColumnsStyle}
                >
                  {yearWeeks.map((week) => (
                    <div key={week[0]?.date} className="gsw-heatmap-week-column">
                      {week.map((day) => (
                        <div
                          key={day.date}
                          className={`gsw-heatmap-cell ${day.inYear ? `gsw-level-${day.level}` : "gsw-level-0"} ${
                            day.inYear && !day.isFuture ? "" : "gsw-heatmap-cell-muted"
                          }`}
                          title={`${day.date}: ${day.count} contributions`}
                        />
                      ))}
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
