
export interface DayHabits {
  noPorn: boolean;
  workout: boolean;
  ipmatStudy: boolean;
  nightWalk: boolean;
}

export interface DayMetrics {
  studyHours: number;
  timeWasted: number;
}

export interface DayRecord {
  id: number;
  dayNumber: number;
  date: string;
  habits: DayHabits;
  metrics: DayMetrics;
  isFilled: boolean;
}

export interface MonthlyGoal {
  month: string;
  studyTarget: number;
  wasteLimit: number;
}

export type HabitKey = keyof DayHabits;
export type MetricKey = keyof DayMetrics;

export interface StreakInfo {
  current: number;
  max: number;
}
