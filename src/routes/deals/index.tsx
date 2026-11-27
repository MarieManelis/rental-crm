import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/deals/')({
  component: DealsPage,
})

function DealsPage() {
  return <h1>Deals</h1>
}
