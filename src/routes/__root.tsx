import { lazy, Suspense } from 'react'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
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
  return (
    <div className={styles.shell}>
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
