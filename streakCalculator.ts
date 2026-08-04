import dayjs from 'dayjs';

export function calculateStreak(logs: { date: string; completed: boolean }[]): number {
  if (logs.length === 0) return 0;

  const sorted = [...logs].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
  let streak = 0;
  let expectedDate = dayjs(sorted[0].date);

  for (const log of sorted) {
    const logDate = dayjs(log.date);
    if (logDate.isSame(expectedDate, 'day') && log.completed) {
      streak++;
      expectedDate = expectedDate.subtract(1, 'day');
    } else if (logDate.isSame(expectedDate, 'day') && !log.completed) {
      break;
    } else if (logDate.isBefore(expectedDate, 'day')) {
      break;
    } else {
      expectedDate = logDate.subtract(1, 'day');
      if (log.completed) {
        streak++;
      } else {
        break;
      }
    }
  }

  return streak;
}
