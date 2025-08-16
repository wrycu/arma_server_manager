import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/pages/AuthPage'

export const Route = createFileRoute('/auth')({
  component: () => {
    const handleLogin = () => {
      // This should redirect to the main app after successful login
      window.location.href = '/'
    }

    return <LoginPage onLogin={handleLogin} />
  },
})
