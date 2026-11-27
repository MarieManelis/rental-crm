import type { ReactNode } from 'react'
import styles from './States.module.css'

export function NotFoundState({ title, message, children }: { title: string; message: string; children: ReactNode }) {
  return (
    <div className={styles.state}>
      <h1>{title}</h1>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>{children}</div>
    </div>
  )
}
