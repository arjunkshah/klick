import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { getSession, setSession } from "../../auth/session";
import { useKlickStore } from "../../data/store";
import { flushWorkspaceSave } from "../../lib/firestoreWorkspace";
import { isFirebaseConfigured } from "../../lib/firebase";

function OnboardingNameFields({
  initialName,
  onContinue,
}: {
  initialName: string;
  onContinue: (name: string) => void;
}) {
  const [nameDraft, setNameDraft] = useState(initialName);
  return (
    <>
      <label className="hub-field-label" htmlFor="onboard-ws">
        Display name
      </label>
      <input
        id="onboard-ws"
        className="hub-input"
        value={nameDraft}
        onChange={(e) => setNameDraft(e.target.value)}
        autoFocus
      />
      <div className="onboarding-actions" style={{ marginTop: "1rem" }}>
        <button
          type="button"
          className="work-btn work-btn--primary"
          onClick={() => onContinue(nameDraft.trim() || "My workspace")}
        >
          Continue
        </button>
      </div>
    </>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const workspace = useKlickStore((s) => s.workspace);
  const patchWorkspace = useKlickStore((s) => s.patchWorkspace);
  const setWorkspaceName = useKlickStore((s) => s.setWorkspaceName);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const persistName = (name: string) => {
    const next = name.trim() || "My workspace";
    setWorkspaceName(next);
    const sess = getSession();
    if (sess) setSession({ ...sess, workspaceName: next });
  };

  const finish = async () => {
    setSaving(true);
    try {
      persistName(workspace.name);
      patchWorkspace({ onboardingDone: true });
      if (user && isFirebaseConfigured()) {
        await flushWorkspaceSave(user.uid, useKlickStore.getState().getWorkspacePayload());
      }
      navigate("/app", { replace: true });
    } finally {
      setSaving(false);
    }
  };

  const nextFromWelcome = (name: string) => {
    persistName(name);
    setStep(1);
  };

  return (
    <div className="app-page hub-page">
      <div className="today-page work-page onboarding-page">
        <header className="today-page__header">
          <p className="today-page__workspace">Welcome</p>
          <h1 className="today-page__title">Set up Klick</h1>
          <p className="hub-lede">Three quick steps—name your workspace, optionally wire tools, then jump into Today.</p>
        </header>

        <div className="onboarding-steps" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`onboarding-step-dot${i === step ? " onboarding-step-dot--active" : ""}${i < step ? " onboarding-step-dot--done" : ""}`}
            />
          ))}
        </div>

        {step === 0 ? (
          <div className="onboarding-card" key={workspace.name}>
            <h2 className="onboarding-card__title">Workspace name</h2>
            <p className="onboarding-card__text">This label appears in the sidebar, Today, and Dex context.</p>
            <OnboardingNameFields initialName={workspace.name} onContinue={nextFromWelcome} />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="onboarding-card">
            <h2 className="onboarding-card__title">Connect your tools</h2>
            <p className="onboarding-card__text">
              Slack, Google Calendar, and GitHub are optional. You can always open Integrations later from the rail.
            </p>
            <ul className="today-dex__list" style={{ marginBottom: "1rem" }}>
              <li className="today-dex__item">
                <Link to="/app/integrations" className="today-link">
                  Integrations
                </Link>{" "}
                — OAuth for Slack &amp; GitHub, Google Calendar via your account.
              </li>
              <li className="today-dex__item">
                <Link to="/app/dex" className="today-link">
                  Dex
                </Link>{" "}
                — ask questions grounded in your workspace.
              </li>
            </ul>
            <div className="onboarding-actions">
              <button type="button" className="work-btn" onClick={() => setStep(0)}>
                Back
              </button>
              <Link to="/app/integrations" className="work-btn">
                Open integrations
              </Link>
              <button type="button" className="work-btn work-btn--primary" onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="onboarding-card">
            <h2 className="onboarding-card__title">You&apos;re ready</h2>
            <p className="onboarding-card__text">
              Today shows your digest, issues, and (when connected) upcoming calendar events. Use the checklist there
              to finish optional setup.
            </p>
            <div className="onboarding-actions">
              <button type="button" className="work-btn" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="button" className="work-btn work-btn--primary" disabled={saving} onClick={() => void finish()}>
                {saving ? "Saving…" : "Enter Klick"}
              </button>
            </div>
          </div>
        ) : null}

        {step === 0 ? (
          <p className="hub-placeholder__sub" style={{ textAlign: "center" }}>
            Already comfortable?{" "}
            <button type="button" className="today-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={() => setStep(2)}>
              Jump to the end
            </button>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}
