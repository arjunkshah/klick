export function mapFirebaseAuthError(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: string }).code)
      : "";

  switch (code) {
    case "auth/configuration-not-found":
      return "Firebase Authentication is not initialized for this project. In Firebase Console, open Authentication and click Get started.";
    case "auth/operation-not-allowed":
      return "This sign-in method is turned off. In Firebase Console → Authentication → Sign-in method, enable Google and Email/Password.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/email-already-in-use":
      return "An account already exists for this email. Try signing in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Use a stronger password (at least 6 characters).";
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    default:
      if (code) return `Could not sign in (${code}).`;
      return err instanceof Error ? err.message : "Something went wrong.";
  }
}
