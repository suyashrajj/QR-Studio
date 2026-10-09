const HISTORY_KEY = 'qr-studio-history-v1';
const THEME_KEY = 'qr-studio-theme-v1';

export function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(item => item && item.id && item.type && item.form && item.settings).slice(0, 10) : [];
  } catch { return []; }
}

export function saveHistoryEntry(entry) {
  try {
    const current = readHistory().filter(item => item.payload !== entry.payload || item.type !== entry.type || JSON.stringify(item.settings) !== JSON.stringify(entry.settings));
    const next = [{ ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: Date.now() }, ...current].slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch { return readHistory(); }
}

export function removeHistoryEntry(id) {
  const next = readHistory().filter(item => item.id !== id);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* Storage may be unavailable. */ }
  return next;
}

export function clearHistory() {
  try { localStorage.removeItem(HISTORY_KEY); } catch { /* Storage may be unavailable. */ }
  return [];
}

export function readTheme() {
  try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
}

export function saveTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* Storage may be unavailable. */ }
}
