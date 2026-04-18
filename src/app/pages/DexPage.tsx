import { Bot } from "lucide-react";
import { DexChatPanel } from "../../components/dex/DexChatPanel";

export function DexPage() {
  return (
    <div className="app-page app-page--dex dex-page">
      <div className="dex-page__intro">
        <header className="dex-page__header">
          <div className="dex-page__title-row">
            <Bot className="dex-page__icon" size={22} strokeWidth={1.65} aria-hidden />
            <div>
              <h1 className="dex-page__title">Dex</h1>
              <p className="dex-page__sub">
                Blockers, inbox, and priorities—answers are grounded in your synced workspace (Firestore) via Gemini.
              </p>
            </div>
          </div>
        </header>
      </div>
      <DexChatPanel />
    </div>
  );
}
