export type ProgressByDayMap = Record<string, number>;

const padDate = (date: Date) => {
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  return utcDate.toISOString().split("T")[0];
};

export const formatDayKey = (date: Date): string => padDate(date);

export const buildDayKey = (year: number, month: number, day: number): string =>
  formatDayKey(new Date(Date.UTC(year, month, day)));
