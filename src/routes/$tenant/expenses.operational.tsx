import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/expenses/operational')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenant/expenses/operational"!</div>
}
