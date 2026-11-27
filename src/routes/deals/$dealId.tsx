import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { dealValue } from '../../domain/aggregates'
import { RentalTypeBadge, StageBadge } from '../../features/deals/DealBadges'
import { DealForm } from '../../features/deals/DealForm'
import { dealDetailOptions } from '../../features/deals/queries'
import { buttonClassName } from '../../ui/Button'
import { formatDate, formatMoney } from '../../ui/format'
import { NotFoundState } from '../../ui/NotFoundState'
import styles from '../../features/deals/DealPage.module.css'

export const Route = createFileRoute('/deals/$dealId')({
  loader: async ({ context, params }) => {
    const deal = await context.queryClient.ensureQueryData(dealDetailOptions(params.dealId))
    if (!deal) throw notFound()
  },
  component: DealPage,
  notFoundComponent: DealNotFound,
})

function DealNotFound() {
  const { dealId } = Route.useParams()
  return (
    <NotFoundState title="Deal not found" message={`There is no deal with the ID ${dealId}.`}>
      <Link to="/deals" className={buttonClassName('primary')}>
        Back to all deals
      </Link>
    </NotFoundState>
  )
}

function DealPage() {
  const { dealId } = Route.useParams()
  const { data: deal } = useSuspenseQuery(dealDetailOptions(dealId))

  if (!deal) return null

  return (
    <div className={styles.page}>
      <Link to="/deals" className={styles.back}>
        ← All deals
      </Link>
      <header className={styles.header}>
        <div>
          <h1>{deal.clientName}</h1>
          <p className={styles.meta}>
            {deal.id} · created {formatDate(deal.createdAt)} · value {formatMoney(dealValue(deal))}
          </p>
        </div>
        <div className={styles.badges}>
          <RentalTypeBadge type={deal.rentalType} />
          <StageBadge stage={deal.stage} />
        </div>
      </header>
      <DealForm key={deal.id} deal={deal} />
    </div>
  )
}
