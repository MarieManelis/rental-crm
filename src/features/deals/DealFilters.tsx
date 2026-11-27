import { useEffect, useState, type KeyboardEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CITIES, RENTAL_TYPE_LABELS, RENTAL_TYPES, STAGE_LABELS, STAGES } from '../../domain/deal'
import { Button } from '../../ui/Button'
import { controlClassName, Field } from '../../ui/Field'
import { hasActiveFilters, type DealSearch } from './search'
import styles from './DealFilters.module.css'

const SEARCH_DEBOUNCE_MS = 300

type FilterPatch = Partial<Pick<DealSearch, 'type' | 'stage' | 'city' | 'minValue' | 'maxValue' | 'q'>>

function parseAmount(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : undefined
}

export function DealFilters({ search }: { search: DealSearch }) {
  const navigate = useNavigate({ from: '/deals/' })
  const [text, setText] = useState(search.q ?? '')
  const [minValue, setMinValue] = useState(search.minValue?.toString() ?? '')
  const [maxValue, setMaxValue] = useState(search.maxValue?.toString() ?? '')
  const [seenRange, setSeenRange] = useState({ min: search.minValue, max: search.maxValue })

  if (seenRange.min !== search.minValue || seenRange.max !== search.maxValue) {
    setSeenRange({ min: search.minValue, max: search.maxValue })
    setMinValue(search.minValue?.toString() ?? '')
    setMaxValue(search.maxValue?.toString() ?? '')
  }

  const clearAll = () => {
    setText('')
    void navigate({ search: (prev) => ({ sort: prev.sort, order: prev.order, page: 1 }) })
  }

  const apply = (patch: FilterPatch, replace = false) =>
    navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }), replace })

  useEffect(() => {
    const next = text.trim() === '' ? undefined : text.trim()
    if (next === search.q) return
    const timer = setTimeout(() => void apply({ q: next }, true), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the typed text should restart the debounce
  }, [text])

  const commitAmount = (key: 'minValue' | 'maxValue', raw: string) => {
    const value = parseAmount(raw)
    if (value !== search[key]) void apply({ [key]: value })
  }

  const onAmountKey = (key: 'minValue' | 'maxValue') => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commitAmount(key, event.currentTarget.value)
  }

  return (
    <form className={styles.filters} role="search" aria-label="Filter deals" onSubmit={(e) => e.preventDefault()}>
      <div className={styles.search}>
        <Field label="Search">
          {(props) => (
            <input
              {...props}
              type="search"
              className={controlClassName}
              placeholder="Client, email or address"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </Field>
      </div>

      <Field label="Rental type">
        {(props) => (
          <select
            {...props}
            className={controlClassName}
            value={search.type ?? ''}
            onChange={(e) => void apply({ type: e.target.value === '' ? undefined : (e.target.value as DealSearch['type']) })}
          >
            <option value="">All types</option>
            {RENTAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {RENTAL_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Stage">
        {(props) => (
          <select
            {...props}
            className={controlClassName}
            value={search.stage ?? ''}
            onChange={(e) => void apply({ stage: e.target.value === '' ? undefined : (e.target.value as DealSearch['stage']) })}
          >
            <option value="">All stages</option>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="City">
        {(props) => (
          <select
            {...props}
            className={controlClassName}
            value={search.city ?? ''}
            onChange={(e) => void apply({ city: e.target.value === '' ? undefined : (e.target.value as DealSearch['city']) })}
          >
            <option value="">All cities</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Min value">
        {(props) => (
          <input
            {...props}
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            className={controlClassName}
            placeholder="€"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            onBlur={(e) => commitAmount('minValue', e.target.value)}
            onKeyDown={onAmountKey('minValue')}
          />
        )}
      </Field>

      <Field label="Max value">
        {(props) => (
          <input
            {...props}
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            className={controlClassName}
            placeholder="€"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            onBlur={(e) => commitAmount('maxValue', e.target.value)}
            onKeyDown={onAmountKey('maxValue')}
          />
        )}
      </Field>

      <div className={styles.actions}>
        <Button variant="ghost" disabled={!hasActiveFilters(search) && text === ''} onClick={clearAll}>
          Clear filters
        </Button>
      </div>
    </form>
  )
}
