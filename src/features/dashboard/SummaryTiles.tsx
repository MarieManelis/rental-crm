import type { DashboardSummary } from '../../domain/aggregates'
import { formatMoney } from '../../ui/format'
import styles from './Dashboard.module.css'

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className={styles.tile} role="group" aria-label={label}>
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileValue} data-testid="tile-value">
        {value}
      </span>
      <span className={styles.tileNote}>{note}</span>
    </div>
  )
}

export function SummaryTiles({ summary }: { summary: DashboardSummary }) {
  return (
    <div className={styles.tiles}>
      <Tile label="Open deals" value={String(summary.openDeals)} note="Inquiry, viewing or contract" />
      <Tile label="Closed this month" value={String(summary.closedThisMonth)} note="Won or lost" />
      <Tile label="Average won deal" value={formatMoney(summary.averageWonValue)} note="Total rental value" />
    </div>
  )
}
