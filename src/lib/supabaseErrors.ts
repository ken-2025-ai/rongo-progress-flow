/**
 * Maps low-level browser/Supabase errors to actionable messages.
 * "TypeError: NetworkError when attempting to fetch resource" is common when
 * the project URL is wrong, offline, or the placeholder client is used.
 */
export function formatSupabaseCallError(err: unknown): string {
  if (err === null || err === undefined) {
    return "Unknown error.";
  }

  if (typeof err === "object" && err !== null && "message" in err) {
    const msg = String((err as { message?: string }).message ?? "");
    if (msg) {
      if (/NetworkError|Failed to fetch|Load failed|Network request failed/i.test(msg)) {
        return (
          "Cannot reach Supabase. Check VITE_SUPABASE_URL, your network, and that the dev server was restarted after changing .env. " +
          "(Raw: " +
          msg +
          ")"
        );
      }
      return msg;
    }
  }

  if (err instanceof TypeError) {
    const m = err.message || String(err);
    if (/fetch|network/i.test(m)) {
      return (
        "Network error — verify Supabase URL/key in .env and connectivity. " + m
      );
    }
    return m;
  }

  return String(err);
}
