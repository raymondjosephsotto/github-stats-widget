import { useState } from "react";
import { GitHubStatsWidget } from "../src";

const DEFAULT_API_URL =
  import.meta.env.VITE_GITHUB_STATS_API_URL ?? "http://localhost:3000/api/github";

const DemoApp = () => {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [submittedApiUrl, setSubmittedApiUrl] = useState(DEFAULT_API_URL);

  return (
    <main className="demo-page">
      <section className="demo-shell">
        <div className="demo-header">
          <p className="demo-eyebrow">Local Preview</p>
          <h1 className="demo-title">GitHub Stats Widget</h1>
          <p className="demo-copy">
            Point this demo at your API endpoint to preview the widget before wiring it into
            another site.
          </p>
        </div>

        <form
          className="demo-form"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedApiUrl(apiUrl);
          }}
        >
          <label className="demo-label" htmlFor="api-url">
            API URL
          </label>
          <div className="demo-controls">
            <input
              id="api-url"
              className="demo-input"
              type="url"
              value={apiUrl}
              onChange={(event) => setApiUrl(event.target.value)}
              placeholder="https://your-api.vercel.app/api/github"
            />
            <button className="demo-button" type="submit">
              Load Preview
            </button>
          </div>
          <p className="demo-hint">
            Default: <code>{DEFAULT_API_URL}</code>
          </p>
        </form>

        <div className="demo-widget">
          <GitHubStatsWidget apiUrl={submittedApiUrl} />
        </div>
      </section>
    </main>
  );
};

export default DemoApp;
