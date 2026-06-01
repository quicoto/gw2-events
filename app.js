'use strict';

const STORAGE_KEY = 'gw2-daily-events';
const TIMEZONE    = 'Europe/Madrid';

/**
 * Returns today's date string as "YYYY-MM-DD" in Madrid timezone.
 * en-CA locale produces ISO-style dates natively.
 */
function getTodayString() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());
}

/** Reads and parses the stored state. Returns null on absence or parse error. */
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/** Writes the current set of checked IDs to localStorage under today's date. */
function saveState() {
  const checked = [...document.querySelectorAll('#events-form input[type="checkbox"]:checked')]
    .map(cb => cb.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayString(), checked }));
}

/**
 * Removes any stored entry whose date does not match today (Madrid time).
 * Returns the stored state if it is still valid, otherwise null.
 */
function cleanStaleEntries() {
  const state = readStorage();
  if (state !== null && state.date !== getTodayString()) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return state;
}

/** Restores checkbox checked states from a valid stored state object. */
function restoreCheckboxes(state) {
  if (!state?.checked) return;
  for (const id of state.checked) {
    const el = document.getElementById(id);
    if (el) el.checked = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const state = cleanStaleEntries();
  restoreCheckboxes(state);

  document.querySelectorAll('#events-form input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', saveState);
  });
});
