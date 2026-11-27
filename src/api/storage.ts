import { dealListSchema, type Deal } from '../domain/deal'
import { createSeedDeals } from './seed'

export const STORAGE_KEY = 'rental-crm:deals'
const STORAGE_VERSION = 1

interface StoredData {
  version: number
  deals: unknown
}

let memoryCopy: Deal[] | null = null

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeRaw(deals: Deal[]): void {
  memoryCopy = deals
  try {
    const data: StoredData = { version: STORAGE_VERSION, deals }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage is unavailable (private mode, quota): keep working in memory.
  }
}

export function loadDeals(): Deal[] {
  const raw = readRaw()

  if (raw === null) {
    if (memoryCopy) return memoryCopy
    const seeded = createSeedDeals()
    writeRaw(seeded)
    return seeded
  }

  const data = JSON.parse(raw) as StoredData
  if (data.version !== STORAGE_VERSION) {
    const seeded = createSeedDeals()
    writeRaw(seeded)
    return seeded
  }

  return dealListSchema.parse(data.deals)
}

export function saveDeals(deals: Deal[]): void {
  writeRaw(deals)
}

export function resetDeals(): Deal[] {
  const seeded = createSeedDeals()
  writeRaw(seeded)
  return seeded
}
