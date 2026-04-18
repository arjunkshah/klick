import { deleteField, doc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { User } from "firebase/auth";

export type IntegrationKey = "slack" | "github" | "googleCalendar";

export async function disconnectIntegration(user: User, key: IntegrationKey): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");

  await setDoc(
    doc(db, "users", user.uid, "klick", "privateIntegrations"),
    { [key]: deleteField() },
    { merge: true },
  );

  const workspacePatch: Record<string, unknown> = {};
  if (key === "slack") {
    workspacePatch.slackConnected = false;
    workspacePatch.slackWorkspace = deleteField();
  }
  if (key === "github") workspacePatch.githubConnected = false;
  if (key === "googleCalendar") workspacePatch.googleCalendarConnected = false;

  await setDoc(doc(db, "users", user.uid, "klick", "state"), { workspace: workspacePatch }, { merge: true });
}
