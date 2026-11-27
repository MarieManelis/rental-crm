import type { ReactNode } from 'react'
import styles from './Badge.module.css'

type Tone = 'neutral' | 'accent' | 'warm' | 'success' | 'danger'

interface BadgeProps {
  tone?: Tone
  children: ReactNode
  testId?: string
}

export function Badge({ tone = 'neutral', children, testId }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`} data-testid={testId}>
      {children}
    </span>
  )
}
