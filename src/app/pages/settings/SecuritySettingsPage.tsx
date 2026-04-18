import { Link } from "react-router-dom";

export function SecuritySettingsPage() {
  return (
    <div className="mx-auto max-w-prose-medium-wide">
      <Link to="/app/settings" className="type-sm text-theme-text-sec hover:text-theme-text">
        ← Settings
      </Link>
      <h1 className="type-md mt-v1 mb-v2">Security</h1>
      <p className="type-base text-theme-text-sec mb-v2">
        SSO, SCIM, and API keys are planned for enterprise. v1 stores data locally in your browser
        only.
      </p>
      <div className="card !p-g1.5 opacity-70">
        <div className="type-base font-medium">API keys</div>
        <p className="type-sm text-theme-text-sec">Not available in v1.</p>
      </div>
    </div>
  );
}
