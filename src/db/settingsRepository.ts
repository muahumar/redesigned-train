import { db } from './database';

export const settingsRepository = {
  get(key: string): string | undefined {
    const row = db.getFirstSync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', [key]);
    return row?.value;
  },
  set(key: string, value: string): void {
    db.runSync(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  },
};
