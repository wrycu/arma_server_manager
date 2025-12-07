import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/mod-subscriptions')({
  beforeLoad: () => {
    throw redirect({ to: '/collections' })
  },
})
