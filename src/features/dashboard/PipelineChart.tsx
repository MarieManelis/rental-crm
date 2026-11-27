import { Link, useNavigate } from '@tanstack/react-router'
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import type { StageCount } from '../../domain/aggregates'
import { RENTAL_TYPE_LABELS, STAGE_LABELS, type Stage } from '../../domain/deal'
import styles from './Dashboard.module.css'

interface PipelineRow extends StageCount {
  label: string
}

export function PipelineChart({ counts }: { counts: StageCount[] }) {
  const navigate = useNavigate()
  const data: PipelineRow[] = counts.map((row) => ({ ...row, label: STAGE_LABELS[row.stage] }))
  const openStage = (stage: Stage) => void navigate({ to: '/deals', search: { stage } })
  const onBarClick = (entry: { payload?: PipelineRow }) => {
    if (entry.payload) openStage(entry.payload.stage)
  }

  return (
    <figure className={styles.card}>
      <figcaption className={styles.cardTitle}>Deals by stage</figcaption>
      <BarChart responsive data={data} style={{ width: '100%', aspectRatio: 1.8 }} margin={{ top: 8, right: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tickLine={false} interval={0} tick={{ fontSize: 12 }} />
        <YAxis width="auto" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <Tooltip cursor={{ fill: 'rgb(16 24 40 / 0.04)' }} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar
          dataKey="long"
          name={RENTAL_TYPE_LABELS.long}
          stackId="type"
          fill="var(--color-long)"
          cursor="pointer"
          onClick={onBarClick}
        />
        <Bar
          dataKey="short"
          name={RENTAL_TYPE_LABELS.short}
          stackId="type"
          fill="var(--color-short)"
          radius={[4, 4, 0, 0]}
          cursor="pointer"
          onClick={onBarClick}
        />
      </BarChart>
      <ul className={styles.stageLinks} aria-label="Open deals by stage">
        {counts.map((row) => {
          const total = row.long + row.short
          return (
            <li key={row.stage}>
              <Link to="/deals" search={{ stage: row.stage }}>
                {STAGE_LABELS[row.stage]}: {total} {total === 1 ? 'deal' : 'deals'}
              </Link>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
