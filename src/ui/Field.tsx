import { useId, type ReactNode } from 'react'
import styles from './Field.module.css'

interface FieldProps {
  label: string
  error?: string | undefined
  hint?: string | undefined
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby': string | undefined }) => ReactNode
}

export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': message ? messageId : undefined })}
      {message && (
        <span id={messageId} className={error ? styles.error : styles.hint} role={error ? 'alert' : undefined}>
          {message}
        </span>
      )}
    </div>
  )
}

export const controlClassName = styles.control
