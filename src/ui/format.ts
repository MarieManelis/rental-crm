const currency = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const date = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const month = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: '2-digit',
  timeZone: 'UTC',
})

export function formatMoney(value: number): string {
  return currency.format(value)
}

export function formatDate(isoDate: string): string {
  return date.format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`))
}

export function formatMonth(monthKey: string): string {
  return month.format(new Date(`${monthKey}-01T00:00:00Z`))
}
