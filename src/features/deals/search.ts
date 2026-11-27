import { z } from 'zod'
import { SORT_FIELDS, SORT_ORDERS, type DealListParams } from '../../api/deals'
import { CITIES, RENTAL_TYPES, STAGES } from '../../domain/deal'

export const DEFAULT_SEARCH = {
  sort: 'createdAt',
  order: 'desc',
  page: 1,
} as const satisfies Pick<DealListParams, 'sort' | 'order' | 'page'>

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

export const dealSearchSchema = z.object({
  type: optional(z.enum(RENTAL_TYPES)),
  stage: optional(z.enum(STAGES)),
  city: optional(z.enum(CITIES)),
  minValue: optional(z.number().nonnegative()),
  maxValue: optional(z.number().nonnegative()),
  q: optional(z.string().trim().min(1).max(80)),
  sort: z.enum(SORT_FIELDS).default(DEFAULT_SEARCH.sort).catch(DEFAULT_SEARCH.sort),
  order: z.enum(SORT_ORDERS).default(DEFAULT_SEARCH.order).catch(DEFAULT_SEARCH.order),
  page: z.int().min(1).default(DEFAULT_SEARCH.page).catch(DEFAULT_SEARCH.page),
})

export type DealSearch = z.output<typeof dealSearchSchema>

export const FILTER_KEYS = ['type', 'stage', 'city', 'minValue', 'maxValue', 'q'] as const satisfies readonly (keyof DealSearch)[]

export function hasActiveFilters(search: DealSearch): boolean {
  return FILTER_KEYS.some((key) => search[key] !== undefined)
}
