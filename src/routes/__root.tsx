import { lazy, Suspense } from 'react'
import { createRootRouteWithContext, Link, Outlet, useRouterState } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { useResetDemoData } from '../features/demo/useResetDemoData'
import { buttonClassName } from '../ui/Button'
import { NotFoundState } from '../ui/NotFoundState'
import styles from '../styles/layout.module.css'

interface RouterContext {
  queryClient: QueryClient
}

const Devtools = import.meta.env.DEV
  ? lazy(() => import('../devtools'))
  : () => null

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <NotFoundState title="Page not found" message="There is no page at this address.">
      <Link to="/" className={buttonClassName('primary')}>
        Go to the dashboard
      </Link>
    </NotFoundState>
  ),
})

function RootLayout() {
  const loading = useRouterState({ select: (state) => state.isLoading })
  const { reset, resetting } = useResetDemoData()

  return (
    <div className={styles.shell}>
      <div className={styles.progress} data-active={loading} role="progressbar" aria-label="Loading" aria-hidden={!loading} />
      <header className={styles.header}>
        <span className={styles.brand}>Rental CRM</span>
        <nav className={styles.nav} aria-label="Main">
          <Link to="/" className={styles.navLink} activeOptions={{ exact: true }}>
            Dashboard
          </Link>
          <Link to="/deals" className={styles.navLink}>
            Deals
          </Link>
        </nav>
        <button
          type="button"
          className={`${buttonClassName('ghost')} ${styles.headerEnd}`}
          disabled={resetting}
          aria-label="Reset demo data"
          title="Restore the original demo deals"
          onClick={() => void reset()}
        >
          <span className={styles.longLabel}>{resetting ? 'Resetting…' : 'Reset demo data'}</span>
          <span className={styles.shortLabel}>Reset</span>
        </button>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <Suspense>
        <Devtools />
      </Suspense>
    </div>
  )
}
