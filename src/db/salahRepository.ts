import { db } from './database';
import { SalahEntry } from '../types';

export const salahRepository = {
  getByDate(date: string): SalahEntry[] {
    return db.getAllSync<SalahEntry>('SELECT * FROM salah_entries WHERE date = ? ORDER BY id', [date]);
  },
  upsert(entry: Omit<SalahEntry, 'id'>): SalahEntry {
    const existing = db.getFirstSync<SalahEntry>(
      'SELECT * FROM salah_entries WHERE date = ? AND prayerName = ?',
      [entry.date, entry.prayerName]
    );
    if (existing) {
      db.runSync(
        'UPDATE salah_entries SET status = ?, loggedAt = ? WHERE id = ?',
        [entry.status, entry.loggedAt, existing.id]
      );
      return { ...existing, ...entry };
    }
    const result = db.runSync(
      'INSERT INTO salah_entries (date, prayerName, status, loggedAt) VALUES (?, ?, ?, ?)',
      [entry.date, entry.prayerName, entry.status, entry.loggedAt]
    );
    return { ...entry, id: Number(result.lastInsertRowId) };
  },
  seedDaily(date: string): SalahEntry[] {
    const prayers = ['tahajjud', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
    const seeded: SalahEntry[] = [];
    for (const name of prayers) {
      const existing = db.getFirstSync<SalahEntry>(
        'SELECT * FROM salah_entries WHERE date = ? AND prayerName = ?',
        [date, name]
      );
      if (existing) {
        seeded.push(existing);
      } else {
        const result = db.runSync(
          'INSERT INTO salah_entries (date, prayerName, status, loggedAt) VALUES (?, ?, ?, ?)',
          [date, name, 'missed', new Date().toISOString()]
        );
        seeded.push({
          id: Number(result.lastInsertRowId),
          date,
          prayerName: name,
          status: 'missed',
          loggedAt: new Date().toISOString(),
        });
      }
    }
    return seeded;
  },
};
