import { addDays, DEMO_TODAY } from '../domain/clock'
import { CITIES, isClosedStage, STAGES, type Deal, type Stage } from '../domain/deal'

export const SEED_DEAL_COUNT = 80
const SEED = 20261127

function createRandom(seed: number) {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))
  const pick = <T>(items: readonly T[]): T => items[int(0, items.length - 1)]!
  return { next, int, pick }
}

const FIRST_NAMES = [
  'Ana', 'Bruno', 'Clara', 'Diogo', 'Elena', 'Filipe', 'Greta', 'Hugo', 'Ines', 'Jonas',
  'Karin', 'Leo', 'Marta', 'Nuno', 'Olga', 'Pedro', 'Rita', 'Simon', 'Teresa', 'Victor',
] as const
const LAST_NAMES = [
  'Almeida', 'Becker', 'Costa', 'Dubois', 'Esteves', 'Fischer', 'Gomes', 'Hansen', 'Lopes', 'Martins',
  'Novak', 'Oliveira', 'Pereira', 'Quinn', 'Ribeiro', 'Silva', 'Tavares', 'Vidal', 'Weber', 'Young',
] as const
const STREETS = [
  'Rua das Flores', 'Rua do Sol', 'Avenida da Liberdade', 'Rua Nova', 'Travessa do Carmo',
  'Rua da Prata', 'Largo do Rato', 'Rua do Norte', 'Avenida do Mar', 'Rua dos Anjos',
] as const

const STAGE_WEIGHTS: Record<Stage, number> = { inquiry: 22, viewing: 18, contract: 14, won: 30, lost: 16 }

function weightedStage(random: ReturnType<typeof createRandom>): Stage {
  const total = STAGES.reduce((sum, stage) => sum + STAGE_WEIGHTS[stage], 0)
  let roll = random.next() * total
  for (const stage of STAGES) {
    roll -= STAGE_WEIGHTS[stage]
    if (roll < 0) return stage
  }
  return 'inquiry'
}

function atNoon(isoDate: string): string {
  return `${isoDate}T12:00:00.000Z`
}

function minDate(a: string, b: string): string {
  return a < b ? a : b
}

export function createSeedDeals(): Deal[] {
  const random = createRandom(SEED)

  return Array.from({ length: SEED_DEAL_COUNT }, (_, index): Deal => {
    const firstName = random.pick(FIRST_NAMES)
    const lastName = random.pick(LAST_NAMES)
    const stage = weightedStage(random)
    const createdDate = addDays(DEMO_TODAY, -random.int(3, 180))
    const closedDate = isClosedStage(stage) ? minDate(addDays(createdDate, random.int(5, 60)), DEMO_TODAY) : null
    const updatedDate = closedDate ?? minDate(addDays(createdDate, random.int(0, 20)), DEMO_TODAY)

    const common = {
      id: `D-${1001 + index}`,
      clientName: `${firstName} ${lastName}`,
      clientEmail: `${firstName}.${lastName}@example.com`.toLowerCase(),
      address: `${random.pick(STREETS)}, ${random.int(1, 180)}`,
      city: random.pick(CITIES),
      stage,
      createdAt: atNoon(createdDate),
      updatedAt: atNoon(updatedDate),
      closedAt: closedDate ? atNoon(closedDate) : null,
    }

    if (random.next() < 0.55) {
      const monthlyRent = random.int(14, 52) * 50
      return {
        ...common,
        rentalType: 'long',
        monthlyRent,
        deposit: monthlyRent * random.int(1, 2),
        contractMonths: random.pick([6, 12, 12, 12, 24, 36] as const),
        moveInDate: addDays(createdDate, random.int(15, 60)),
      }
    }

    const checkIn = addDays(createdDate, random.int(5, 90))
    return {
      ...common,
      rentalType: 'short',
      nightlyRate: random.int(10, 50) * 5,
      checkIn,
      checkOut: addDays(checkIn, random.int(2, 21)),
      guests: random.int(1, 6),
    }
  })
}
