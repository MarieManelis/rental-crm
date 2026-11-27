import { createFileRoute, notFound } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { dealDetailOptions } from '../../features/deals/queries'

export const Route = createFileRoute('/deals/$dealId')({
  loader: async ({ context, params }) => {
    const deal = await context.queryClient.ensureQueryData(dealDetailOptions(params.dealId))
    if (!deal) throw notFound()
  },
  component: DealPage,
})

function DealPage() {
  const { dealId } = Route.useParams()
  const { data: deal } = useSuspenseQuery(dealDetailOptions(dealId))

  if (!deal) return null

  return <h1>{deal.clientName}</h1>
}
