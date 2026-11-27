export const DEMO_TODAY = '2026-11-27'

export function demoNow(): string {
  const timeOfDay = new Date().toISOString().slice(10)
  return `${DEMO_TODAY}${timeOfDay}`
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function addMonths(month: string, count: number): string {
  const [year, monthIndex] = month.split('-').map(Number) as [number, number]
  const date = new Date(Date.UTC(year, monthIndex - 1 + count, 1))
  return date.toISOString().slice(0, 7)
}

export function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  const from = Date.parse(`${fromIsoDate.slice(0, 10)}T00:00:00Z`)
  const to = Date.parse(`${toIsoDate.slice(0, 10)}T00:00:00Z`)
  return Math.round((to - from) / 86_400_000)
}
