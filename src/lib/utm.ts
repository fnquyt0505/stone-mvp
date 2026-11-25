const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;
const UTM_STORAGE = "lead-utm";

/**
 * First-touch UTM params for the browser session, as a JSON string for the
 * quote form (validated again on the server). Safe if storage is blocked.
 */
export function readSessionUtm(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const fresh = Object.fromEntries(
      UTM_KEYS.flatMap((k) => {
        const v = params.get(`utm_${k}`);
        return v ? [[k, v.slice(0, 100)]] : [];
      }),
    );
    if (Object.keys(fresh).length) sessionStorage.setItem(UTM_STORAGE, JSON.stringify(fresh));
    return sessionStorage.getItem(UTM_STORAGE) ?? "";
  } catch {
    return "";
  }
}
