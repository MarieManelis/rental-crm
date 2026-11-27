import { addMonths, daysBetween, DEMO_TODAY, monthKey } from './clock'
import { isClosedStage, STAGES, type Deal, type Stage } from './deal'

export function nights(checkIn: string, checkOut: string): number {
  return Math.max(0, daysBetween(checkIn, checkOut))
}

export function dealValue(deal: Deal): number {
  return deal.rentalType === 'long'
    ? deal.monthlyRent * deal.contractMonths
    : deal.nightlyRate * nights(deal.checkIn, deal.checkOut)
}

const COUNTS_INCOME: readonly Stage[] = ['contract', 'won']

export interface MonthlyIncome {
  month: string
  long: number
  short: number
}

export function incomeByMonth(deals: Deal[], fromMonth: string, monthCount: number): MonthlyIncome[] {
  const months = Array.from({ length: monthCount }, (_, i) => addMonths(fromMonth, i))
  const rows = new Map(months.map((month) => [month, { month, long: 0, short: 0 }]))

  for (const deal of deals) {
    if (!COUNTS_INCOME.includes(deal.stage)) continue

    if (deal.rentalType === 'long') {
      const start = monthKey(deal.moveInDate)
      for (let i = 0; i < deal.contractMonths; i++) {
        const row = rows.get(addMonths(start, i))
        if (row) row.long += deal.monthlyRent
      }
    } else {
      const row = rows.get(monthKey(deal.checkIn))
      if (row) row.short += dealValue(deal)
    }
  }

  return months.map((month) => rows.get(month)!)
}

export interface StageCount {
  stage: Stage
  long: number
  short: number
}

export function countsByStage(deals: Deal[]): StageCount[] {
  return STAGES.map((stage) => {
    const inStage = deals.filter((deal) => deal.stage === stage)
    return {
      stage,
      long: inStage.filter((deal) => deal.rentalType === 'long').length,
      short: inStage.filter((deal) => deal.rentalType === 'short').length,
    }
  })
}

export interface DashboardSummary {
  openDeals: number
  closedThisMonth: number
  averageWonValue: number
}

export function summarize(deals: Deal[], today: string = DEMO_TODAY): DashboardSummary {
  const currentMonth = monthKey(today)
  const won = deals.filter((deal) => deal.stage === 'won')
  const wonTotal = won.reduce((sum, deal) => sum + dealValue(deal), 0)

  return {
    openDeals: deals.filter((deal) => !isClosedStage(deal.stage)).length,
    closedThisMonth: deals.filter(
      (deal) => isClosedStage(deal.stage) && deal.closedAt !== null && monthKey(deal.closedAt) === currentMonth,
    ).length,
    averageWonValue: won.length === 0 ? 0 : Math.round(wonTotal / won.length),
  }
}
