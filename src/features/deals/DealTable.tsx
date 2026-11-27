import { Link, useNavigate } from '@tanstack/react-router'
import type { SortField } from '../../api/deals'
import { dealValue } from '../../domain/aggregates'
import type { Deal } from '../../domain/deal'
import { formatDate, formatMoney } from '../../ui/format'
import { RentalTypeBadge, StageBadge } from './DealBadges'
import type { DealSearch } from './search'
import styles from './DealTable.module.css'

const SORT_LABELS: Record<SortField, string> = {
  createdAt: 'created date',
  value: 'value',
  stage: 'stage',
}

function SortHeader({ field, label, search }: { field: SortField; label: string; search: DealSearch }) {
  const navigate = useNavigate({ from: '/deals/' })
  const active = search.sort === field
  const ariaSort = active ? (search.order === 'asc' ? 'ascending' : 'descending') : 'none'

  return (
    <th scope="col" aria-sort={ariaSort} className={field === 'value' ? styles.numeric : undefined}>
      <button
        type="button"
        className={styles.sortButton}
        aria-label={`Sort by ${SORT_LABELS[field]}`}
        onClick={() =>
          void navigate({
            search: (prev) => ({
              ...prev,
              sort: field,
              order: active && prev.order === 'desc' ? 'asc' : 'desc',
              page: 1,
            }),
          })
        }
      >
        {label}
        <span aria-hidden="true" className={styles.sortIcon}>
          {active ? (search.order === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  )
}

export function DealTable({ deals, search, busy }: { deals: Deal[]; search: DealSearch; busy: boolean }) {
  return (
    <div className={styles.wrapper} aria-busy={busy} data-busy={busy}>
      <table className={styles.table} aria-label="Deals">
        <thead>
          <tr>
            <th scope="col">Client</th>
            <th scope="col">Property</th>
            <th scope="col">Type</th>
            <SortHeader field="stage" label="Stage" search={search} />
            <SortHeader field="value" label="Value" search={search} />
            <SortHeader field="createdAt" label="Created" search={search} />
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id}>
              <td data-label="Client" data-testid="deal-client">
                <Link to="/deals/$dealId" params={{ dealId: deal.id }} className={styles.clientLink}>
                  {deal.clientName}
                </Link>
              </td>
              <td data-label="Property">
                <span className={styles.address}>{deal.address}</span>
                <span className={styles.city} data-testid="deal-city">
                  {deal.city}
                </span>
              </td>
              <td data-label="Type">
                <RentalTypeBadge type={deal.rentalType} testId="deal-type" />
              </td>
              <td data-label="Stage">
                <StageBadge stage={deal.stage} testId="deal-stage" />
              </td>
              <td data-label="Value" className={styles.numeric} data-testid="deal-value">
                {formatMoney(dealValue(deal))}
              </td>
              <td data-label="Created">{formatDate(deal.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
