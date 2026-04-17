import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/supplier/history')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenant/supplier/history"!</div>
}
