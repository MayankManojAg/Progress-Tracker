
import { DayRecord, HabitKey, StreakInfo } from '../types';

export const calculateStreak = (records: DayRecord[], habit: HabitKey): StreakInfo => {
  let maxStreak = 0;
  let tempStreak = 0;

  // We iterate through all records to find the historical max
  for (let i = 0; i < records.length; i++) {
    if (records[i].habits[habit]) {
      tempStreak++;
    } else {
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      tempStreak = 0;
    }
  }
  if (tempStreak > maxStreak) maxStreak = tempStreak;

  // Current streak: Count backwards from the last FILLED day
  const filledSorted = records
    .filter(r => r.isFilled)
    .sort((a, b) => b.dayNumber - a.dayNumber);
    
  if (filledSorted.length === 0) return { current: 0, max: maxStreak };

  let current = 0;
  // If the last filled day is not today or yesterday, streak might be dead
  // But for simple habit tracking, we'll just count consecutive 'yes' from the latest log
  for (const record of filledSorted) {
    if (record.habits[habit]) {
      current++;
    } else {
      break;
    }
  }

  return { current, max: maxStreak };
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getMonthName = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('default', { month: 'long' });
};

export const generateInitialData = (startDate: Date = new Date()): DayRecord[] => {
  const data: DayRecord[] = [];
  // Ensure we start from Jan 1st of the current year (2025)
  const startOfYear = new Date(startDate.getFullYear(), 0, 1);
  
  for (let i = 1; i <= 365; i++) {
    const currentDate = new Date(startOfYear);
    currentDate.setDate(startOfYear.getDate() + (i - 1));
    
    data.push({
      id: i,
      dayNumber: i,
      date: formatDate(currentDate),
      habits: {
        noPorn: false,
        workout: false,
        ipmatStudy: false,
        nightWalk: false,
      },
      metrics: {
        studyHours: 0,
        timeWasted: 0,
      },
      isFilled: false,
    });
  }
  return data;
};
