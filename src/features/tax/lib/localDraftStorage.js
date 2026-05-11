export const draftStorage = {
  save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
  load: (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; }
  },
  clear: (key) => localStorage.removeItem(key),
};
