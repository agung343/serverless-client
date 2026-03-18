import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(static)/services')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(static)/services"!</div>
}
