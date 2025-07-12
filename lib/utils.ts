import { startOfToday, subYears } from "date-fns";

export const today = startOfToday();

export const fiveYearsAgo = subYears(today, 5);