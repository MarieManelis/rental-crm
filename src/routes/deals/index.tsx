import { createFileRoute, Link, stripSearchParams, useRouterState } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { dealListOptions } from '../../features/deals/queries'
import { DEFAULT_SEARCH, dealSearchSchema } from '../../features/deals/search'
import { DealFilters } from '../../features/deals/DealFilters'
import { DealTable } from '../../features/deals/DealTable'
import { Pager } from '../../features/deals/Pager'
import { SortSelect } from '../../features/deals/SortSelect'
import { EmptyState } from '../../ui/EmptyState'
import styles from '../../features/deals/DealsPage.module.css'

export const Route = createFileRoute('/deals/')({
  validateSearch: dealSearchSchema,
  search: {
    middlewares: [stripSearchParams(DEFAULT_SEARCH)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(dealListOptions(deps)),
  component: DealsPage,
})

function DealsPage() {
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(dealListOptions(search))
  const busy = useRouterState({ select: (state) => state.isLoading })

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1>Deals</h1>
        <span className={styles.total} data-testid="deal-total">
          {data.total} {data.total === 1 ? 'deal' : 'deals'}
        </span>
      </div>

      <DealFilters search={search} />
      <SortSelect search={search} />

      {data.items.length === 0 ? (
        <EmptyState title="No deals match these filters">
          <Link to="/deals">Show all deals</Link>
        </EmptyState>
      ) : (
        <>
          <DealTable deals={data.items} search={search} busy={busy} />
          <Pager page={data.page} pageCount={data.pageCount} />
        </>
      )}
    </div>
  )
}
