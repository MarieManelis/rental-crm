import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { countsByStage, incomeByMonth, summarize } from '../domain/aggregates'
import { addMonths, DEMO_TODAY, monthKey } from '../domain/clock'
import { allDealsOptions } from '../features/deals/queries'
import { IncomeChart } from '../features/dashboard/IncomeChart'
import { PipelineChart } from '../features/dashboard/PipelineChart'
import { SummaryTiles } from '../features/dashboard/SummaryTiles'
import { formatDate } from '../ui/format'
import styles from '../features/dashboard/Dashboard.module.css'

const INCOME_MONTHS = 12
const INCOME_FIRST_MONTH = addMonths(monthKey(DEMO_TODAY), -5)

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(allDealsOptions()),
  component: DashboardPage,
})

function DashboardPage() {
  const { data: deals } = useSuspenseQuery(allDealsOptions())

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1>Dashboard</h1>
        <p className={styles.asOf}>Data as of {formatDate(DEMO_TODAY)}</p>
      </div>
      <SummaryTiles summary={summarize(deals)} />
      <div className={styles.charts}>
        <PipelineChart counts={countsByStage(deals)} />
        <IncomeChart rows={incomeByMonth(deals, INCOME_FIRST_MONTH, INCOME_MONTHS)} />
      </div>
    </div>
  )
}
