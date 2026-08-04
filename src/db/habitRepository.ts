import { db } from './database';
import { Habit, HabitLog } from '../types';

export const habitRepository = {
  getAll(): Habit[] {
    return db.getAllSync('SELECT * FROM habits WHERE archived = 0') as Habit[];
  },
  getById(id: number): Habit | undefined {
    const row = db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?', [id]);
    return row ?? undefined;
  },
  create(habit: Omit<Habit, 'id'>): Habit {
    const result = db.runSync(
      'INSERT INTO habits (name, icon, type, frequency, scheduledTime, target, reminderEnabled, archived, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        habit.name,
        habit.icon,
        habit.type,
        habit.frequency,
        habit.scheduledTime ?? null,
        habit.target ?? null,
        habit.reminderEnabled ? 1 : 0,
        habit.archived ? 1 : 0,
        habit.createdAt,
      ]
    );
    return { ...habit, id: Number(result.lastInsertRowId) };
  },
  update(id: number, changes: Partial<Omit<Habit, 'id'>>): Habit {
    const existing = this.getById(id);
    if (!existing) throw new Error('Habit not found');
    const updated = { ...existing, ...changes };
    db.runSync(
      'UPDATE habits SET name = ?, icon = ?, type = ?, frequency = ?, scheduledTime = ?, target = ?, reminderEnabled = ?, archived = ?, createdAt = ? WHERE id = ?',
      [
        updated.name,
        updated.icon,
        updated.type,
        updated.frequency,
        updated.scheduledTime ?? null,
        updated.target ?? null,
        updated.reminderEnabled ? 1 : 0,
        updated.archived ? 1 : 0,
        updated.createdAt,
        id,
      ]
    );
    return updated;
  },
  delete(id: number): void {
    db.runSync('UPDATE habits SET archived = 1 WHERE id = ?', [id]);
  },
  logCompletion(log: Omit<HabitLog, 'id'>): HabitLog {
    const result = db.runSync(
      'INSERT INTO habit_logs (habitId, date, completed, completedAt, note) VALUES (?, ?, ?, ?, ?)',
      [log.habitId, log.date, log.completed ? 1 : 0, log.completedAt ?? null, log.note ?? null]
    );
    return { ...log, id: Number(result.lastInsertRowId) };
  },
  updateLog(id: number, changes: Partial<Omit<HabitLog, 'id'>>): HabitLog {
    const existing = db.getFirstSync<HabitLog>('SELECT * FROM habit_logs WHERE id = ?', [id]);
    if (!existing) throw new Error('HabitLog not found');
    const updated = { ...existing, ...changes };
    db.runSync(
      'UPDATE habit_logs SET habitId = ?, date = ?, completed = ?, completedAt = ?, note = ? WHERE id = ?',
      [
        updated.habitId,
        updated.date,
        updated.completed ? 1 : 0,
        updated.completedAt ?? null,
        updated.note ?? null,
        id,
      ]
    );
    return updated;
  },
  getLogsForDate(date: string): HabitLog[] {
    return db.getAllSync('SELECT * FROM habit_logs WHERE date = ?', [date]) as HabitLog[];
  },
};
