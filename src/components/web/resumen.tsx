import { motion, AnimatePresence } from 'motion/react'
import { IconLock as Lock, IconUserCog as UserRoundCog, IconTrendingUp as TrendingUp, IconTrendingDown as TrendingDown } from '@tabler/icons-react'
import { cn, money, pct } from '@/lib/utils'
import { spring } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { mesEstadoMap } from '@/components/shared/status'
import { GastosCard } from './gastos-card'
import { HISTORIAL, MES, TESORERA, type Gastos } from '@/demo/data'
import type { DemoState, Role } from '@/demo/script'
import { estadoMes, gastoTotal, totals } from '@/demo/totals'


const estadoCopy = {
  alcanza: (margen: number) => `Lo recaudado ya cubre el gasto fijo del mes, con ${money(margen)} de margen.`,
  riesgo: () => 'Todavía no cubre el gasto fijo. Si se cobra lo que falta, alcanza.',
  'no-alcanza': () => 'Aunque se cobren todas las cuotas, no alcanza para cubrir el gasto fijo estimado.',
}

const toneBg = {
  alcanza: 'bg-success-soft',
  riesgo: 'bg-warning-soft',
  'no-alcanza': 'bg-danger-soft',
}
const toneText = { alcanza: 'text-success', riesgo: 'text-warning', 'no-alcanza': 'text-danger' }
const toneBar = { alcanza: 'bg-success', riesgo: 'bg-warning', 'no-alcanza': 'bg-danger' }

export function ResumenView({
  state,
  role,
  gastos,
  setGastos,
  highlightGastos,
  onAction,
}: {
  state: DemoState
  role: Role
  gastos: Gastos
  setGastos: (g: Gastos) => void
  highlightGastos: boolean
  onAction: (a: string) => void
}) {
  const t = totals(state)
  const gasto = gastoTotal(gastos)
  const estado = estadoMes(t.recaudado, t.esperado, gasto)
  const info = mesEstadoMap[estado]
  const scale = Math.max(t.esperado, gasto) * 1.04
  const isComision = role === 'comision'
  // Comparación justa: el mes en curso contra el anterior al mismo día.
  const octubre = HISTORIAL[HISTORIAL.length - 1]
  const cobrado = t.pagadas / t.total
  const delta = Math.round((cobrado - octubre.alDia6) * 100)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight @lg:text-2xl">Resumen de {MES.toLowerCase()}</h1>
        <p className="mt-0.5 text-sm text-fg-muted">Al 6 de noviembre · La cuota vence el 10/11</p>
      </div>

      {/* Respuesta principal: ¿alcanza? */}
      <motion.section layout transition={spring.moderate} className={cn('rounded-xl p-5 @lg:p-6', toneBg[estado])}>
        <AnimatePresence mode="wait">
          <motion.div
            key={estado}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={spring.fast}
            className="flex items-start gap-3"
          >
            <info.Icon className={cn('mt-1 size-7 shrink-0', toneText[estado])} aria-hidden />
            <div>
              <p className={cn('text-2xl font-semibold tracking-tight @lg:text-3xl', toneText[estado])}>
                {MES}: {info.label.toLowerCase()}
              </p>
              <p className="mt-1 max-w-lg text-[15px] text-fg">{estadoCopy[estado](t.recaudado - gasto)}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Barra: recaudado vs gasto fijo, con lo esperado de fondo */}
        <div className="mt-6">
          <div className="relative h-4 rounded-full bg-card/70">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-fg/10"
              animate={{ width: `${(t.esperado / scale) * 100}%` }}
              transition={spring.slow}
              aria-hidden
            />
            <motion.div
              className={cn('absolute inset-y-0 left-0 rounded-full', toneBar[estado])}
              animate={{ width: `${(t.recaudado / scale) * 100}%` }}
              transition={spring.slow}
              aria-hidden
            />
            <motion.div
              className="absolute -top-1.5 -bottom-1.5 w-0.5 rounded-full bg-fg"
              animate={{ left: `${(gasto / scale) * 100}%` }}
              transition={spring.slow}
              aria-hidden
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-fg-muted">
            <span className="flex items-center gap-1.5">
              <span className={cn('size-2.5 rounded-full', toneBar[estado])} /> Recaudado{' '}
              <strong className="tabular text-fg">{money(t.recaudado)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-0.5 rounded-full bg-fg" /> Gasto fijo estimado <strong className="tabular text-fg">{money(gasto)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-fg/15" /> Si se cobra todo <strong className="tabular text-fg">{money(t.esperado)}</strong>
            </span>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-3 @lg:grid-cols-3">
        <Card className="border border-border/60 bg-card p-4">
          <p className="text-[13px] text-fg-muted">Recaudado</p>
          <p className="tabular mt-1 text-2xl font-semibold tracking-tight">{money(t.recaudado)}</p>
          <p className="mt-1 text-xs text-fg-muted">
            {t.pagadas} de {t.total} cuotas ({pct(t.pagadas / t.total)})
          </p>
        </Card>
        <Card className="border border-border/60 bg-card p-4">
          <p className="text-[13px] text-fg-muted">Falta cobrar</p>
          <p className="tabular mt-1 text-2xl font-semibold tracking-tight">{money(t.falta)}</p>
          <p className="mt-1 text-xs text-fg-muted">{t.faltaCuotas} cuotas</p>
        </Card>
        <Card className="border border-border/60 bg-card p-4">
          <p className="text-[13px] text-fg-muted">Vs. octubre a esta fecha</p>
          <p className={cn('tabular mt-1 flex items-center gap-1.5 text-2xl font-semibold tracking-tight', delta >= 0 ? 'text-success' : 'text-danger')}>
            {delta >= 0 ? <TrendingUp className="size-6" aria-hidden /> : <TrendingDown className="size-6" aria-hidden />}
            {delta >= 0 ? '+' : '−'}
            {Math.abs(delta)} puntos
          </p>
          <p className="mt-1 text-xs text-fg-muted">
            Hoy {pct(cobrado)} cobrado · Octubre al 6/10: {pct(octubre.alDia6)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <GastosCard gastos={gastos} setGastos={setGastos} editable={isComision} pulse={highlightGastos} />

        <div className="space-y-3">
          {isComision && (
            <section className="rounded-xl border border-border/60 bg-card p-4 @lg:p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                <UserRoundCog className="size-4 text-fg-muted" aria-hidden /> Tesorera autorizada
              </h2>
              <p className="mt-2 text-[15px]">{TESORERA.nombre}</p>
              <p className="tabular text-[13px] text-fg-muted">{TESORERA.telefono} · registra pagos por WhatsApp</p>
              <Button variant="tertiary" className="mt-3" onClick={() => onAction('cambiar-tesorero')}>
                Cambiar tesorero
              </Button>
            </section>
          )}
          <section className="flex gap-3 rounded-xl bg-muted p-4 text-[13px] text-fg-muted">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              {isComision
                ? 'La comisión ve totales. El detalle de quién debe lo gestiona el tesorero, para no exponer la situación de cada familia.'
                : 'La comisión ve este resumen con totales, sin nombres de socios.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
