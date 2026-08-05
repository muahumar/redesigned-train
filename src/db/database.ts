import { Platform } from 'react-native';

// ─── Web mock DB (expo-sqlite is native-only) ───────────────────────────────
// On web, provide an in-memory no-op that satisfies the same API surface
// so all repositories and screens work without crashing.
const webMockDb = {
  execSync: (_sql: string) => {},
  runSync: (_sql: string, _params?: any[]): { lastInsertRowId: number; changes: number } => ({
    lastInsertRowId: Date.now(),
    changes: 0,
  }),
  getFirstSync: <T = any>(_sql: string, _params?: any[]): T | null => null,
  getAllSync: <T = any>(_sql: string, _params?: any[]): T[] => [],
};

// ─── Real SQLite DB (iOS / Android) ─────────────────────────────────────────
let db: typeof webMockDb;

if (Platform.OS === 'web') {
  db = webMockDb;
} else {
  // Dynamic require so the bundler doesn't try to resolve expo-sqlite on web
  const SQLite = require('expo-sqlite');
  db = SQLite.openDatabaseSync('istiqamah.db');
}

export { db };

export function initDatabase() {
  if (Platform.OS === 'web') return; // no-op on web

  db.execSync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      type TEXT NOT NULL DEFAULT 'custom',
      frequency TEXT NOT NULL DEFAULT 'daily',
      scheduledTime TEXT,
      target TEXT,
      reminderEnabled INTEGER NOT NULL DEFAULT 0,
      archived INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS salah_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      prayerName TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'missed',
      loggedAt TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(date, prayerName)
    );
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habitId INTEGER NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      completedAt TEXT,
      note TEXT,
      FOREIGN KEY (habitId) REFERENCES habits(id)
    );
    CREATE TABLE IF NOT EXISTS day_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      wakeUpTime TEXT,
      sleepTime TEXT
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}
