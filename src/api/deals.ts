import { dealValue } from '../domain/aggregates'
import { demoNow } from '../domain/clock'
import {
  dealSchema,
  isClosedStage,
  STAGES,
  type City,
  type Deal,
  type DealFormValues,
  type RentalType,
  type Stage,
} from '../domain/deal'
import { loadDeals, resetDeals, saveDeals } from './storage'

export const PAGE_SIZE = 20
export const FAILURE_FLAG = 'demo-fail'

export const SORT_FIELDS = ['createdAt', 'value', 'stage'] as const
export const SORT_ORDERS = ['asc', 'desc'] as const
export type SortField = (typeof SORT_FIELDS)[number]
export type SortOrder = (typeof SORT_ORDERS)[number]

export interface DealListParams {
  type?: RentalType | undefined
  stage?: Stage | undefined
  city?: City | undefined
  minValue?: number | undefined
  maxValue?: number | undefined
  q?: string | undefined
  sort: SortField
  order: SortOrder
  page: number
}

export interface DealListResult {
  items: Deal[]
  total: number
  page: number
  pageCount: number
}

export class DemoApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DemoApiError'
  }
}

const MIN_DELAY_MS = 300
const MAX_DELAY_MS = 600

async function simulateNetwork(): Promise<void> {
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
  await new Promise((resolve) => setTimeout(resolve, delay))
  if (new URLSearchParams(window.location.search).has(FAILURE_FLAG)) {
    throw new DemoApiError('The demo server is not responding (failure mode is on).')
  }
}

function matches(deal: Deal, params: DealListParams): boolean {
  if (params.type && deal.rentalType !== params.type) return false
  if (params.stage && deal.stage !== params.stage) return false
  if (params.city && deal.city !== params.city) return false

  const value = dealValue(deal)
  if (params.minValue !== undefined && value < params.minValue) return false
  if (params.maxValue !== undefined && value > params.maxValue) return false

  if (params.q) {
    const needle = params.q.trim().toLowerCase()
    const haystack = `${deal.clientName} ${deal.clientEmail} ${deal.address}`.toLowerCase()
    if (!haystack.includes(needle)) return false
  }
  return true
}

function compare(a: Deal, b: Deal, sort: SortField): number {
  switch (sort) {
    case 'createdAt':
      return a.createdAt.localeCompare(b.createdAt)
    case 'value':
      return dealValue(a) - dealValue(b)
    case 'stage':
      return STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage)
  }
}

export async function listDeals(params: DealListParams): Promise<DealListResult> {
  await simulateNetwork()
  const direction = params.order === 'asc' ? 1 : -1
  const filtered = loadDeals()
    .filter((deal) => matches(deal, params))
    .sort((a, b) => compare(a, b, params.sort) * direction || a.id.localeCompare(b.id))

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(params.page, pageCount)
  const start = (page - 1) * PAGE_SIZE

  return { items: filtered.slice(start, start + PAGE_SIZE), total: filtered.length, page, pageCount }
}

export async function listAllDeals(): Promise<Deal[]> {
  await simulateNetwork()
  return loadDeals()
}

export async function getDeal(id: string): Promise<Deal | null> {
  await simulateNetwork()
  return loadDeals().find((deal) => deal.id === id) ?? null
}

export async function updateDeal(id: string, values: DealFormValues): Promise<Deal> {
  await simulateNetwork()
  const deals = loadDeals()
  const index = deals.findIndex((deal) => deal.id === id)
  const existing = deals[index]
  if (!existing) {
    throw new DemoApiError(`Deal ${id} no longer exists.`)
  }

  const now = demoNow()
  const closedAt = isClosedStage(values.stage) ? (isClosedStage(existing.stage) ? existing.closedAt : now) : null

  const updated = dealSchema.parse({
    ...values,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now,
    closedAt,
  })

  deals[index] = updated
  saveDeals(deals)
  return updated
}

export async function resetDemoData(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS))
  resetDeals()
}
