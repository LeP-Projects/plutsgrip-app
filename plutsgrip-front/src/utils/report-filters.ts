import { endOfMonth, endOfQuarter, endOfWeek, endOfYear, format, startOfMonth, startOfQuarter, startOfWeek, startOfYear, subMonths, subYears } from "date-fns"

export interface ReportFilterState {
  timeRange: string
  category: string
  type: string
  startDate?: Date
  endDate?: Date
}

export interface ResolvedDateRange {
  startDate?: string
  endDate?: string
}

export function resolveDateRange(filters: ReportFilterState): ResolvedDateRange {
  const now = new Date()

  switch (filters.timeRange) {
    case "thisWeek":
      return {
        startDate: format(startOfWeek(now), "yyyy-MM-dd"),
        endDate: format(endOfWeek(now), "yyyy-MM-dd"),
      }
    case "thisMonth":
      return {
        startDate: format(startOfMonth(now), "yyyy-MM-dd"),
        endDate: format(endOfMonth(now), "yyyy-MM-dd"),
      }
    case "lastMonth": {
      const previousMonth = subMonths(now, 1)
      return {
        startDate: format(startOfMonth(previousMonth), "yyyy-MM-dd"),
        endDate: format(endOfMonth(previousMonth), "yyyy-MM-dd"),
      }
    }
    case "thisQuarter":
      return {
        startDate: format(startOfQuarter(now), "yyyy-MM-dd"),
        endDate: format(endOfQuarter(now), "yyyy-MM-dd"),
      }
    case "thisYear":
      return {
        startDate: format(startOfYear(now), "yyyy-MM-dd"),
        endDate: format(endOfYear(now), "yyyy-MM-dd"),
      }
    case "lastYear": {
      const previousYear = subYears(now, 1)
      return {
        startDate: format(startOfYear(previousYear), "yyyy-MM-dd"),
        endDate: format(endOfYear(previousYear), "yyyy-MM-dd"),
      }
    }
    case "custom":
      return {
        startDate: filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : undefined,
        endDate: filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : undefined,
      }
    default:
      return {}
  }
}
