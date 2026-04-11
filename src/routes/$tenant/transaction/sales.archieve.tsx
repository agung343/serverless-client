import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/transaction/sales/archieve')({
  validateSearch: () => ({}),
    component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenant/transaction/sales/archieve"!</div>
}
