import { lazy, Suspense } from 'react'
import { createRootRouteWithContext, Link, Outlet, useRouterState } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import styles from '../styles/layout.module.css'

interface RouterContext {
  queryClient: QueryClient
}

const Devtools = import.meta.env.DEV
  ? lazy(() => import('../devtools'))
  : () => null

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  const loading = useRouterState({ select: (state) => state.isLoading })

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
