import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconArrowDownLeft as ArrowDownLeft, IconSparkles as Sparkles, IconPhoto as FileImage, IconCircleCheck as CheckCircle2, IconSearch as Search, IconConfetti as PartyPopper, IconBan as Ban } from '@tabler/icons-react'
import { cn, money } from '@/lib/utils'
import { spring } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { EXCEPCIONES, GRUPOS, type Excepcion } from '@/demo/data'
import type { DemoState } from '@/demo/script'

function Pulse({ on }: { on: boolean }) {
  if (!on) return null
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute -inset-1 rounded-[12px] ring-2 ring-brand/70"
      animate={{ opacity: [0.25, 1, 0.25] }}
      transition={{ duration: 1.8, repeat: Infinity }}
    />
  )
}

function ExcepcionCard({ e, activeAction, onAction }: { e: Excepcion; activeAction?: string; onAction: (a: string) => void }) {
  const [recordar, setRecordar] = useState(true)
  const grupo = e.sugerencia && GRUPOS.find((g) => g.id === e.sugerencia!.grupoId)
  const assignAction = `asignar-${e.id}`
  const noCuotaAction = `nocuota-${e.id}`
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
      transition={spring.moderate}
      className="rounded-xl border border-border/60 bg-card p-4 @lg:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-fg-muted">
            <ArrowDownLeft className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-medium">Transferencia de {e.origen}</p>
            <p className="text-[13px] text-fg-muted">{e.fecha} · Cuenta del club</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {e.comprobante && (
            <Badge color="gray" className="[&>span:last-child]:inline-flex [&>span:last-child]:items-center [&>span:last-child]:gap-1 [&>span:last-child]:[text-box:none]">
              <FileImage className="size-3.5" aria-hidden /> Comprobante por WhatsApp
            </Badge>
          )}
          <p className="tabular text-xl font-semibold tracking-tight">{money(e.monto)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-muted p-3.5">
        {e.sugerencia ? (
          <>
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-brand-text">
              <Sparkles className="size-3.5" aria-hidden /> Sugerencia
            </p>
            <p className="mt-1 text-[15px] font-semibold">{e.sugerencia.texto}</p>
            {grupo && <p className="text-[13px] text-fg-muted">Responsable de pago: {grupo.responsable}</p>}
            <p className="mt-1.5 text-[13px] text-fg-muted">{e.sugerencia.motivo}</p>
          </>
        ) : (
          <p className="text-[14px] text-fg-muted">
            El monto no coincide con ninguna cuota pendiente. ¿Es un pago de otra cosa, como el buffet o una rifa?
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        {e.sugerencia ? (
          <Switch className="shrink-0" label="Recordar esta cuenta" checked={recordar} onToggle={() => setRecordar((r) => !r)} />
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-2">
          {e.sugerencia ? (
            <>
              <Button variant="ghost" leadingIcon={Ban} onClick={() => onAction(noCuotaAction)}>
                No es una cuota
              </Button>
              <Button variant="tertiary" leadingIcon={Search} onClick={() => onAction('buscar')}>
                Otro socio
              </Button>
              <span className="relative inline-flex">
                <Button leadingIcon={CheckCircle2} onClick={() => onAction(assignAction)}>
                  {e.sugerencia.parcial ? 'Asignar pago parcial' : 'Asignar'}
                </Button>
                <Pulse on={activeAction === assignAction} />
              </span>
            </>
          ) : (
            <>
              <Button variant="tertiary" leadingIcon={Search} onClick={() => onAction('buscar')}>
                Buscar socio
              </Button>
              <span className="relative inline-flex">
                <Button leadingIcon={Ban} onClick={() => onAction(noCuotaAction)}>
                  No es una cuota
                </Button>
                <Pulse on={activeAction === noCuotaAction} />
              </span>
            </>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export function RevisarView({ state, activeAction, onAction }: { state: DemoState; activeAction?: string; onAction: (a: string) => void }) {
  const pendientes = EXCEPCIONES.filter((e) => state.excepciones[e.id] === 'pendiente')
  const resueltas = EXCEPCIONES.filter((e) => ['asignada', 'no-cuota'].includes(state.excepciones[e.id]))
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight @lg:text-2xl">Pagos para revisar</h1>
        <p className="mt-0.5 max-w-xl text-sm text-fg-muted">
          Pagos que ya están en la cuenta del club pero que no pudimos asignar solos. Cuando asignás uno, el socio recibe su confirmación por WhatsApp.
        </p>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {pendientes.map((e) => (
            <ExcepcionCard key={e.id} e={e} activeAction={activeAction} onAction={onAction} />
          ))}
          {pendientes.length === 0 && (
            <motion.div
              key="vacio"
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring.moderate}
              className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center"
            >
              <PartyPopper className="size-7 text-brand-text" aria-hidden />
              <p className="text-[15px] font-semibold">Todo al día</p>
              <p className="text-sm text-fg-muted">No quedan pagos para revisar.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {resueltas.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">Resueltos hoy</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border/60 bg-card">
            {resueltas.map((e) => {
              const asignada = state.excepciones[e.id] === 'asignada'
              return (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <CheckCircle2 className={cn('size-4 shrink-0', asignada ? 'text-success' : 'text-fg-subtle')} aria-hidden />
                    <span className="truncate">
                      {money(e.monto)} de {e.origen} → {asignada ? e.sugerencia?.texto : 'No es una cuota'}
                    </span>
                  </span>
                  <span className="text-xs text-fg-muted">
                    {!asignada ? 'Fuera de las cuotas' : e.sugerencia?.parcial ? 'Le avisamos cuánto le falta' : 'Socio notificado por WhatsApp'}
                  </span>
                </motion.li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
