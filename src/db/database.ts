import * as SQLite from 'expo-sqlite';

const DB_NAME = 'istiqamah.db';

export const db = SQLite.openDatabaseSync(DB_NAME);

export function initDatabase() {
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
