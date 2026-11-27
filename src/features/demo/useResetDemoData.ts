import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { resetDemoData } from '../../api/deals'
import { dealKeys } from '../deals/queries'

export function useResetDemoData() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [resetting, setResetting] = useState(false)

  const reset = async () => {
    setResetting(true)
    try {
      await resetDemoData()
      await queryClient.invalidateQueries({ queryKey: dealKeys.all })
      await router.invalidate()
    } finally {
      setResetting(false)
    }
  }

  return { reset, resetting }
}
