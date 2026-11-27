import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { allDealsOptions } from '../../features/deals/queries'

export const Route = createFileRoute('/deals/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(allDealsOptions()),
  component: DealsPage,
})

function DealsPage() {
  const { data: deals } = useSuspenseQuery(allDealsOptions())

  return (
    <>
      <h1>Deals</h1>
      <p data-testid="deal-count">{deals.length} deals</p>
    </>
  )
}
