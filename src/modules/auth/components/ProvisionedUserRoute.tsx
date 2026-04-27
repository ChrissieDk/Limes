import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/userService'
import { userHasProvisionedSim } from '../utils/userProvisioning'

type Props = {
  children: ReactNode
}

export default function ProvisionedUserRoute({ children }: Props) {
  const navigate = useNavigate()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const user = await userService.getCurrentUser()
        if (cancelled) return
        if (!userHasProvisionedSim(user)) {
          navigate('/dashboard/packages', { replace: true })
          return
        }
        if (!cancelled) setAllowed(true)
      } catch {
        if (cancelled) return
        navigate('/dashboard/packages', { replace: true })
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [navigate])

  if (!allowed) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-white/20 border-t-white animate-spin" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  return <>{children}</>
}
