import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export function initFirebaseAdmin() {
  if (getApps().length > 0) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set.");
  }
  const parsed = JSON.parse(raw);
  initializeApp({
    credential: cert(parsed),
  });
}

export function adminAuth() {
  initFirebaseAdmin();
  return getAuth();
}

export function adminDb() {
  initFirebaseAdmin();
  return getFirestore();
}
