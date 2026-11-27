import { useEffect } from 'react'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { FAILURE_FLAG } from '../api/deals'
import { useResetDemoData } from '../features/demo/useResetDemoData'
import { Button } from './Button'
import styles from './States.module.css'

function failureModeIsOn(): boolean {
  return new URLSearchParams(window.location.search).has(FAILURE_FLAG)
}

export function ErrorState({ error }: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()
  const { reset: resetDemoData, resetting } = useResetDemoData()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  const turnOffFailureMode = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete(FAILURE_FLAG)
    router.history.replace(`${url.pathname}${url.search}${url.hash}`)
  }

  return (
    <div className={styles.state} role="alert">
      <h1>Something went wrong</h1>
      <p className={styles.message}>{error instanceof Error ? error.message : 'Unknown error.'}</p>
      <div className={styles.actions}>
        {failureModeIsOn() ? (
          <Button variant="primary" onClick={turnOffFailureMode}>
            Turn off failure mode and retry
          </Button>
        ) : (
          <Button variant="primary" onClick={() => void router.invalidate()}>
            Retry
          </Button>
        )}
        <Button variant="secondary" disabled={resetting} onClick={() => void resetDemoData()}>
          Reset demo data
        </Button>
      </div>
    </div>
  )
}
