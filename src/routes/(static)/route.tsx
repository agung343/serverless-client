import { createFileRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(static)')({
  component: RouteComponent,
})

function RouteComponent() {
  return (<>
    <div>Im static Layout</div>
    <Outlet />
  </>)
}
