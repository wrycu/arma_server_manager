import { LoginForm } from './components/LoginForm'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-muted text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <img src="/tuna.png" alt="ARMA Server Manager" className="size-4" />
          </div>
          Arma Server Manager
        </a>
        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  )
}
