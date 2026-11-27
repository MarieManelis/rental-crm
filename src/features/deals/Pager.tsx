import { Link } from '@tanstack/react-router'
import { buttonClassName } from '../../ui/Button'
import styles from './Pager.module.css'

export function Pager({ page, pageCount }: { page: number; pageCount: number }) {
  const hasPrevious = page > 1
  const hasNext = page < pageCount

  return (
    <nav className={styles.pager} aria-label="Pagination">
      <Link
        from="/deals/"
        search={(prev) => ({ ...prev, page: page - 1 })}
        className={buttonClassName()}
        aria-disabled={!hasPrevious}
        disabled={!hasPrevious}
      >
        Previous page
      </Link>
      <span className={styles.status}>
        Page {page} of {pageCount}
      </span>
      <Link
        from="/deals/"
        search={(prev) => ({ ...prev, page: page + 1 })}
        className={buttonClassName()}
        aria-disabled={!hasNext}
        disabled={!hasNext}
      >
        Next page
      </Link>
    </nav>
  )
}
