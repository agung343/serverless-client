import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/(static)/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-2">
      <h3>Go To Demo Project</h3>
    </div>
  )
}
