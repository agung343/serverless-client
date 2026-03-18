import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/kasir')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenant/kasir"!</div>
}
