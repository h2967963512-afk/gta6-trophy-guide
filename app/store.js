// Saved progress for the Leonida Trophy Guide: localStorage only, no account,
// no network. Progress is a set of trophy ids, plus the reader's settings.
// Export writes a JSON file; import reads one back and replaces the set.
const PROGRESS_KEY = 'leonida-trophy-guide-progress-v1';
const SETTINGS_KEY = 'leonida-trophy-guide-settings-v1';

// Thirteen trophies a first-time reader is likely to have on a fresh save:
// the opening mission, the first chapters and the early open-world finds.
// Used only by the demo button and ?demo=1, never silently.
export const DEMO_EARNED = [2, 3, 4, 8, 15, 16, 20, 21, 35, 42, 44, 46, 55];

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids)) return new Set();
    return new Set(ids.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // A full or blocked store just means progress will not survive reload.
  }
}

export function loadSettings() {
  const defaults = { spoilers: false, earnedOnly: false, kind: 'all', grade: 'all', query: '' };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Settings are a convenience; losing them is not fatal.
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // Nothing to clear.
  }
}

export function exportProgress(earned) {
  const payload = {
    app: 'leonida-trophy-guide',
    game: 'Grand Theft Auto VI',
    version: 1,
    exported_at: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importProgressFile(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) throw new Error('That file has no earned list in it.');
  const earned = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
  return earned;
}
