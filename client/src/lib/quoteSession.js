const STORAGE_KEY = "quoteai:last-quote";

export function saveQuoteSession(payload) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadQuoteSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export function clearQuoteSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
}
