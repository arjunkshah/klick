import {
  GoogleAuthProvider,
  linkWithPopup,
  reauthenticateWithPopup,
  type User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

/**
 * Link Google OAuth with Calendar read scope and persist access token for Calendar API calls.
 */
export async function connectGoogleCalendar(user: User): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");

  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
  provider.setCustomParameters({ prompt: "consent", access_type: "offline" });

  let result;
  try {
    result = await linkWithPopup(user, provider);
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "auth/provider-already-linked" || code === "auth/credential-already-in-use") {
      result = await reauthenticateWithPopup(user, provider);
    } else {
      throw e;
    }
  }

  const cred = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = cred?.accessToken;
  if (!accessToken) {
    throw new Error("Google did not return a Calendar access token. Try again or use another Google account.");
  }

  const expiresInSec = 3600;
  await setDoc(
    doc(db, "users", user.uid, "klick", "privateIntegrations"),
    {
      googleCalendar: {
        accessToken,
        expiresAt: Date.now() + expiresInSec * 1000,
        connectedAt: new Date().toISOString(),
      },
    },
    { merge: true },
  );

  await setDoc(
    doc(db, "users", user.uid, "klick", "state"),
    { workspace: { googleCalendarConnected: true } },
    { merge: true },
  );
}
