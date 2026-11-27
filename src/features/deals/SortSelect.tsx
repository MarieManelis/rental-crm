import { useNavigate } from '@tanstack/react-router'
import { SORT_FIELDS, SORT_ORDERS, type SortField, type SortOrder } from '../../api/deals'
import { controlClassName, Field } from '../../ui/Field'
import type { DealSearch } from './search'
import styles from './SortSelect.module.css'

const OPTIONS: { value: `${SortField}:${SortOrder}`; label: string }[] = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'value:desc', label: 'Value: high to low' },
  { value: 'value:asc', label: 'Value: low to high' },
  { value: 'stage:asc', label: 'Stage: inquiry first' },
  { value: 'stage:desc', label: 'Stage: closed first' },
]

function parse(value: string): { sort: SortField; order: SortOrder } | null {
  const [sort, order] = value.split(':')
  const validSort = SORT_FIELDS.find((field) => field === sort)
  const validOrder = SORT_ORDERS.find((item) => item === order)
  return validSort && validOrder ? { sort: validSort, order: validOrder } : null
}

export function SortSelect({ search }: { search: DealSearch }) {
  const navigate = useNavigate({ from: '/deals/' })

  return (
    <div className={styles.sortSelect}>
      <Field label="Sort by">
        {(props) => (
          <select
            {...props}
            className={controlClassName}
            value={`${search.sort}:${search.order}`}
            onChange={(e) => {
              const next = parse(e.target.value)
              if (next) void navigate({ search: (prev) => ({ ...prev, ...next, page: 1 }) })
            }}
          >
            {OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </Field>
    </div>
  )
}
