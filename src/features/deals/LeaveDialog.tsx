import { useEffect, useId, useRef } from 'react'
import { Button } from '../../ui/Button'
import styles from './LeaveDialog.module.css'

interface LeaveDialogProps {
  open: boolean
  onStay: () => void
  onLeave: () => void
}

export function LeaveDialog({ open, onStay, onLeave }: LeaveDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onStay()
      }}
    >
      <h2 id={titleId}>Leave without saving?</h2>
      <p className={styles.text}>Your changes to this deal have not been saved and will be lost.</p>
      <div className={styles.actions}>
        <Button variant="primary" onClick={onStay} autoFocus>
          Stay
        </Button>
        <Button variant="secondary" onClick={onLeave}>
          Leave
        </Button>
      </div>
    </dialog>
  )
}
