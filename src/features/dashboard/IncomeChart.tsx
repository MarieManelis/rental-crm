import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlyIncome } from '../../domain/aggregates'
import { RENTAL_TYPE_LABELS } from '../../domain/deal'
import { formatMoney, formatMonth } from '../../ui/format'
import styles from './Dashboard.module.css'

const compact = new Intl.NumberFormat('en-IE', { notation: 'compact', maximumFractionDigits: 1 })

export function IncomeChart({ rows }: { rows: MonthlyIncome[] }) {
  return (
    <figure className={styles.card}>
      <figcaption className={styles.cardTitle}>Expected income by month</figcaption>
      <BarChart responsive data={rows} style={{ width: '100%', aspectRatio: 1.8 }} margin={{ top: 8, right: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tickLine={false}
          interval="preserveStartEnd"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          width="auto"
          tickFormatter={(value: number) => `€${compact.format(value)}`}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          labelFormatter={(label) => (typeof label === 'string' ? formatMonth(label) : '')}
          formatter={(value) => formatMoney(Number(value))}
          cursor={{ fill: 'rgb(16 24 40 / 0.04)' }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="long" name={RENTAL_TYPE_LABELS.long} stackId="type" fill="var(--color-long)" />
        <Bar dataKey="short" name={RENTAL_TYPE_LABELS.short} stackId="type" fill="var(--color-short)" radius={[4, 4, 0, 0]} />
      </BarChart>
      <p className={styles.cardNote}>Deals at the contract stage or won. Long-term rent is spread over the contract months.</p>
    </figure>
  )
}
