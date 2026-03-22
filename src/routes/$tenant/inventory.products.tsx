import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/inventory/products')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenant/inventory/product"!</div>
}
