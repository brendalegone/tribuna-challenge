import { AnimatePresence, motion } from 'motion/react'
import { IconListCheck as ListChecks, IconInbox as Inbox, IconChartPie as PieChart, IconChartBar as BarChart, IconSun as Sun, IconMoon as Moon } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { ValueTabs } from '@/components/shared/value-tabs'
import { ClubAvatar } from '@/components/chat/phone'
import { TribunaMark } from '@/components/brand'
import { CLUB, MES, type Gastos } from '@/demo/data'
import type { DemoState, Role, WebTab } from '@/demo/script'
import type { Theme } from '@/App'
import { pendingExceptions } from '@/demo/totals'
import { CuotasView } from './cuotas'
import { RevisarView } from './revisar'
import { ResumenView } from './resumen'
import { HistorialView } from './historial'

interface Props {
  theme: Theme
  setTheme: (t: Theme) => void
  state: DemoState
  tab: WebTab
  setTab: (t: WebTab) => void
  role: Role
  setRole: (r: Role) => void
  gastos: Gastos
  setGastos: (g: Gastos) => void
  activeAction?: string
  highlightGastos: boolean
  onAction: (a: string) => void
}

export function WebApp(p: Props) {
  const pending = pendingExceptions(p.state)
  const nav = [
    { tab: 'cuotas' as WebTab, label: 'Cuotas', Icon: ListChecks, roles: ['tesorero'] },
    { tab: 'revisar' as WebTab, label: 'Pagos para revisar', Icon: Inbox, roles: ['tesorero'], count: pending },
    { tab: 'resumen' as WebTab, label: 'Resumen del mes', Icon: PieChart, roles: ['tesorero', 'comision'] },
    { tab: 'historial' as WebTab, label: 'Historial', Icon: BarChart, roles: ['tesorero', 'comision'] },
  ].filter((n) => n.roles.includes(p.role))

  return (
    // El modo claro/oscuro se aplica solo al producto: la web de Tribuna.
    <div
      data-web-root
      className={cn(
        '@container relative flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] border border-border bg-bg text-fg shadow-card',
        p.theme === 'dark' && 'dark',
      )}
    >
      {/* barra superior de la web */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 @lg:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <TribunaMark />
          <span className="hidden h-5 w-px bg-border @md:block" aria-hidden />
          <div className="hidden min-w-0 items-center gap-2 @md:flex">
            <ClubAvatar size={24} />
            <span className="truncate text-sm font-medium">{CLUB.corto}</span>
            <span className="text-sm text-fg-subtle">· {MES}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content={p.theme === 'light' ? 'Modo oscuro' : 'Modo claro'}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => p.setTheme(p.theme === 'light' ? 'dark' : 'light')}
              aria-label={p.theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={p.theme}
                  className="grid place-items-center"
                  initial={{ rotate: -60, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 60, opacity: 0 }}
                  transition={spring.fast}
                >
                  {p.theme === 'light' ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
                </motion.span>
              </AnimatePresence>
            </Button>
          </Tooltip>
          <span className="hidden h-5 w-px bg-border @md:block" aria-hidden />
          <span className="hidden text-xs text-fg-muted @xl:inline">Ver como</span>
          <ValueTabs<Role>
            ariaLabel="Ver la web como"
            size="compact"
            value={p.role}
            onChange={(r) => {
              p.setRole(r)
              if (r === 'comision' && p.tab !== 'historial') p.setTab('resumen')
            }}
            options={[
              { value: 'tesorero', label: 'Tesorero' },
              { value: 'comision', label: 'Comisión' },
            ]}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {/* navegación: Tabs oficiales de Fluid */}
        <nav aria-label="Secciones" className="shrink-0 border-b border-border bg-card px-3 py-2 @lg:px-4">
          <ValueTabs<WebTab>
            ariaLabel="Secciones de la web"
            value={p.tab}
            onChange={p.setTab}
            options={nav.map((n) => ({
              value: n.tab,
              icon: n.Icon,
              label: n.count ? `${n.label} · ${n.count}` : n.label,
            }))}
          />
        </nav>

        <main className="thin-scroll min-h-0 flex-1 overflow-y-auto p-4 @lg:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${p.tab}-${p.role}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={spring.moderate}
              className="mx-auto max-w-5xl"
            >
              {p.tab === 'cuotas' && <CuotasView state={p.state} activeAction={p.activeAction} onAction={p.onAction} />}
              {p.tab === 'revisar' && <RevisarView state={p.state} activeAction={p.activeAction} onAction={p.onAction} />}
              {p.tab === 'historial' && <HistorialView state={p.state} gastos={p.gastos} />}
              {p.tab === 'resumen' && (
                <ResumenView
                  state={p.state}
                  role={p.role}
                  gastos={p.gastos}
                  setGastos={p.setGastos}
                  highlightGastos={p.highlightGastos}
                  onAction={p.onAction}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
