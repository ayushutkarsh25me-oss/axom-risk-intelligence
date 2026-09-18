'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'warning' | 'critical'

interface Toast {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (t: { title: string; description?: string; variant?: ToastVariant }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const variantStyles: Record<ToastVariant, { border: string; icon: React.ReactNode }> = {
  default: { border: 'border-primary/40', icon: <Info className="size-4 text-primary" /> },
  success: {
    border: 'border-risk-low/50',
    icon: <CheckCircle2 className="size-4 text-risk-low" />,
  },
  warning: {
    border: 'border-risk-high/50',
    icon: <TriangleAlert className="size-4 text-risk-high" />,
  },
  critical: {
    border: 'border-risk-critical/60',
    icon: <TriangleAlert className="size-4 text-risk-critical" />,
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback<ToastContextValue['toast']>(
    ({ title, description, variant = 'default' }) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, title, description, variant }])
      setTimeout(() => remove(id), 4500)
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const style = variantStyles[t.variant]
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-lg border bg-popover/95 p-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in',
                style.border,
              )}
            >
              <span className="mt-0.5 shrink-0">{style.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-popover-foreground">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
