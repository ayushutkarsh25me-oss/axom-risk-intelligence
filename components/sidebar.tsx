'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Activity,
  BellRing,
  Database,
  LayoutDashboard,
  Map,
  MapPin,
  Menu,
  Mountain,
  Settings,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Risk Map', href: '/risk-map', icon: Map },
  { label: 'Locations', href: '/locations', icon: MapPin },
  { label: 'Risk Analytics', href: '/analytics', icon: Activity },
  { label: 'Alerts', href: '/alerts', icon: BellRing },
  { label: 'Risk Simulator', href: '/simulator', icon: SlidersHorizontal },
  { label: 'Data Sources', href: '/data-sources', icon: Database },
  { label: 'Settings', href: '/settings', icon: Settings },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
            <Mountain className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="font-mono text-base font-bold tracking-[0.2em] text-sidebar-foreground">
              AXOM
            </p>
            <p className="text-[10px] tracking-wide text-muted-foreground">RISK INTELLIGENCE</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-4">
        <p className="px-2 pb-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          Command
        </p>
        {NAV.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('size-4', active && 'text-primary')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          System Status
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-risk-low opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-risk-low" />
          </span>
          <span className="text-sm font-semibold text-risk-low">ONLINE</span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">v0.9.2 · PROTOTYPE</p>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3.5 z-50 rounded-md border border-border bg-card p-2 text-foreground lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 h-screen">
          <NavContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-64 border-r border-sidebar-border bg-sidebar animate-in slide-in-from-left">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3.5 z-10 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
            <NavContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
