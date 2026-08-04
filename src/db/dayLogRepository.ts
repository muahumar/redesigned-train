import { db } from './database';
import { DayLog } from '../types';

export const dayLogRepository = {
  getByDate(date: string): DayLog | undefined {
    const row = db.getFirstSync<DayLog>('SELECT * FROM day_logs WHERE date = ?', [date]);
    return row ?? undefined;
  },
  upsert(log: Omit<DayLog, 'id'>): DayLog {
    const existing = db.getFirstSync<DayLog>('SELECT * FROM day_logs WHERE date = ?', [log.date]);
    if (existing) {
      db.runSync(
        'UPDATE day_logs SET wakeUpTime = ?, sleepTime = ? WHERE id = ?',
        [log.wakeUpTime ?? null, log.sleepTime ?? null, existing.id]
      );
      return { ...existing, ...log };
    }
    const result = db.runSync(
      'INSERT INTO day_logs (date, wakeUpTime, sleepTime) VALUES (?, ?, ?)',
      [log.date, log.wakeUpTime ?? null, log.sleepTime ?? null]
    );
    return { ...log, id: Number(result.lastInsertRowId) };
  },
};
