import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/expenses/purchase')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenant/expenses/purchase"!</div>
}
