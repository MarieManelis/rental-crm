import { z } from 'zod'
import { daysBetween } from './clock'

export const RENTAL_TYPES = ['long', 'short'] as const
export const STAGES = ['inquiry', 'viewing', 'contract', 'won', 'lost'] as const
export const OPEN_STAGES = ['inquiry', 'viewing', 'contract'] as const
export const CLOSED_STAGES = ['won', 'lost'] as const
export const CITIES = ['Lisbon', 'Porto', 'Faro', 'Coimbra', 'Braga'] as const

export type RentalType = (typeof RENTAL_TYPES)[number]
export type Stage = (typeof STAGES)[number]
export type City = (typeof CITIES)[number]

export const RENTAL_TYPE_LABELS: Record<RentalType, string> = {
  long: 'Long-term',
  short: 'Short-term',
}

export const STAGE_LABELS: Record<Stage, string> = {
  inquiry: 'Inquiry',
  viewing: 'Viewing',
  contract: 'Contract',
  won: 'Won',
  lost: 'Lost',
}

export function isClosedStage(stage: Stage): boolean {
  return (CLOSED_STAGES as readonly Stage[]).includes(stage)
}

const amount = (label: string) =>
  z.number({ error: `Enter the ${label}` }).positive(`The ${label} must be more than 0`).max(1_000_000)

const commonFields = {
  clientName: z.string().trim().min(2, 'Enter the client name').max(80),
  clientEmail: z.email('Enter a valid email'),
  address: z.string().trim().min(5, 'Enter the property address').max(120),
  city: z.enum(CITIES, { error: 'Choose a city' }),
  stage: z.enum(STAGES, { error: 'Choose a stage' }),
}

const longTermFields = {
  rentalType: z.literal('long'),
  monthlyRent: amount('monthly rent'),
  deposit: z.number({ error: 'Enter the deposit' }).min(0, 'The deposit cannot be negative').max(1_000_000),
  contractMonths: z
    .int({ error: 'Enter the contract length' })
    .min(1, 'At least 1 month')
    .max(60, 'At most 60 months'),
  moveInDate: z.iso.date({ error: 'Enter the move-in date' }),
}

const shortTermFields = {
  rentalType: z.literal('short'),
  nightlyRate: amount('nightly rate'),
  checkIn: z.iso.date({ error: 'Enter the check-in date' }),
  checkOut: z.iso.date({ error: 'Enter the check-out date' }),
  guests: z.int({ error: 'Enter the number of guests' }).min(1, 'At least 1 guest').max(12, 'At most 12 guests'),
}

const serverFields = {
  id: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  closedAt: z.iso.datetime().nullable(),
}

const stayDatesSchema = z.object({
  rentalType: z.literal('short'),
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
})

function stayDatesInOrder(value: { rentalType: RentalType; checkIn?: string; checkOut?: string }): boolean {
  return value.rentalType !== 'short' || !value.checkIn || !value.checkOut || daysBetween(value.checkIn, value.checkOut) >= 1
}

const stayDatesOptions = () => ({
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
  // Run even when unrelated fields are invalid, as long as both dates parse.
  when: (payload: { value: unknown }) => stayDatesSchema.safeParse(payload.value).success,
})

export const longTermDealSchema = z.object({ ...serverFields, ...commonFields, ...longTermFields })
export const shortTermDealSchema = z.object({ ...serverFields, ...commonFields, ...shortTermFields })

export const dealSchema = z
  .discriminatedUnion('rentalType', [longTermDealSchema, shortTermDealSchema])
  .refine(stayDatesInOrder, stayDatesOptions())

export const dealListSchema = z.array(dealSchema)

export type Deal = z.infer<typeof dealSchema>
export type LongTermDeal = z.infer<typeof longTermDealSchema>
export type ShortTermDeal = z.infer<typeof shortTermDealSchema>

export const dealFormSchema = z
  .discriminatedUnion('rentalType', [
    z.object({ ...commonFields, ...longTermFields }),
    z.object({ ...commonFields, ...shortTermFields }),
  ])
  .refine(stayDatesInOrder, stayDatesOptions())

export type DealFormInput = z.input<typeof dealFormSchema>
export type DealFormValues = z.output<typeof dealFormSchema>
