import { motion } from 'motion/react'
import { IconFlag as Flag, IconTrendingUp as TrendingUp } from '@tabler/icons-react'
import { cn, money, pct } from '@/lib/utils'
import { spring } from '@/lib/motion'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { CUOTA, HISTORIAL, MES, TOTAL_CUOTAS, type Gastos } from '@/demo/data'
import type { DemoState } from '@/demo/script'
import { gastoTotal, totals } from '@/demo/totals'

const badgeFix =
  '[&>span:last-child]:inline-flex [&>span:last-child]:items-center [&>span:last-child]:gap-1 [&>span:last-child]:[text-box:none]'

interface Fila {
  mes: string
  corto: string
  recaudado: number
  gasto: number
  cobrado: number
  enCurso?: boolean
  partida?: boolean
}

function Resultado({ f }: { f: Fila }) {
  if (f.enCurso)
    return (
      <Badge color="blue" className={badgeFix}>
        En curso
      </Badge>
    )
  const ok = f.recaudado >= f.gasto
  return (
    <Badge color={ok ? 'green' : 'red'} className={badgeFix}>
      {ok ? 'Alcanzó' : 'No alcanzó'}
    </Badge>
  )
}

export function HistorialView({ state, gastos }: { state: DemoState; gastos: Gastos }) {
  const t = totals(state)
  const filas: Fila[] = [
    ...HISTORIAL.map((h, i) => ({
      mes: h.mes,
      corto: h.corto,
      recaudado: h.cobradas * CUOTA,
      gasto: h.gasto,
      cobrado: h.cobradas / TOTAL_CUOTAS,
      partida: i === 0,
    })),
    { mes: MES, corto: 'Nov', recaudado: t.recaudado, gasto: gastoTotal(gastos), cobrado: t.pagadas / t.total, enCurso: true },
  ]
  const partida = filas[0]
  const ultimoCerrado = filas[filas.length - 2]
  const mejora = Math.round((ultimoCerrado.cobrado - partida.cobrado) * 100)
  const max = Math.max(...filas.map((f) => Math.max(f.recaudado, f.gasto)), t.esperado) * 1.08

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight @lg:text-2xl">Historial</h1>
        <p className="mt-0.5 text-sm text-fg-muted">Desde agosto, cuando el club empezó a usar Tribuna</p>
      </div>

      {/* Las métricas de la hipótesis: cobro contra el punto de partida y automatización */}
      <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="flex items-start gap-3 rounded-xl bg-success-soft p-4 @lg:p-5">
          <TrendingUp className="mt-0.5 size-6 shrink-0 text-success" aria-hidden />
          <div>
            <p className="text-[17px] font-semibold text-success">+{mejora} puntos de cobro desde el punto de partida</p>
            <p className="mt-0.5 text-[14px] text-fg">
              En agosto se cobró el {pct(partida.cobrado)} de las cuotas; en octubre, el {pct(ultimoCerrado.cobrado)}.
            </p>
          </div>
        </section>
        <Card className="border border-border/60 bg-card p-4 @lg:p-5">
          <p className="text-[13px] text-fg-muted">Pagos digitales confirmados solos</p>
          <p className="tabular mt-1 text-2xl font-semibold tracking-tight">{pct(HISTORIAL[HISTORIAL.length - 1].automatico)}</p>
          <p className="mt-1 text-xs text-fg-muted">
            En octubre, sin intervención de la tesorera · Agosto: {pct(HISTORIAL[0].automatico)}
          </p>
        </Card>
      </div>

      <Card className="border border-border/60 bg-card p-4 @lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold">Recaudado y gasto fijo por mes</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-fg-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-brand" /> Recaudado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3.5 rounded-full bg-fg" /> Gasto fijo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-brand/35" /> En curso
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3 @lg:gap-6" role="img" aria-label="Gráfico de recaudado y gasto fijo por mes">
          {filas.map((f, i) => {
            return (
              <div key={f.mes} className="flex flex-col items-center gap-2">
                <span className="tabular text-[12px] font-medium text-fg">
                  {/* formato corto en pantallas angostas: «$ 4,4 M» */}
                  <span className="hidden @2xl:inline">{money(f.recaudado)}</span>
                  <span className="@2xl:hidden">$ {(f.recaudado / 1e6).toLocaleString('es-AR', { maximumFractionDigits: 1 })} M</span>
                </span>
                <div className="relative h-44 w-full max-w-24">
                  <motion.div
                    className={cn(
                      'absolute inset-x-0 bottom-0 rounded-t-lg',
                      f.enCurso ? 'bg-brand/35' : 'bg-brand',
                    )}
                    style={
                      f.enCurso
                        ? { backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 6px, rgb(255 255 255 / 0.35) 6px 9px)' }
                        : undefined
                    }
                    initial={{ height: 0 }}
                    animate={{ height: `${(f.recaudado / max) * 100}%` }}
                    transition={{ ...spring.slow, delay: i * 0.05 }}
                  />
                  <motion.div
                    className="absolute -inset-x-1.5 h-0.5 rounded-full bg-fg"
                    initial={false}
                    animate={{ bottom: `${(f.gasto / max) * 100}%` }}
                    transition={spring.slow}
                    title={`Gasto fijo ${money(f.gasto)}`}
                  />
                </div>
                <span className="flex items-center gap-1 text-[13px] font-medium">
                  {f.partida && <Flag className="size-3.5 text-fg-muted" aria-label="Punto de partida" />}
                  {f.corto}
                </span>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-[12px] text-fg-muted">
          Noviembre está en curso: muestra lo recaudado al día 6. Si se cobra todo, llega a {money(t.esperado)}.
        </p>
      </Card>

      <Card className="border border-border/60 bg-card p-0">
        <div className="px-2 pb-2 @lg:px-3">
          <Table className="table-fixed">
            <colgroup>
              <col />
              <col className="w-[90px]" />
              <col className="hidden w-[130px] @2xl:table-column" />
              <col className="hidden w-[130px] @2xl:table-column" />
              <col className="w-[116px]" />
            </colgroup>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Cobrado</TableHead>
                <TableHead className="hidden text-right @2xl:table-cell">Recaudado</TableHead>
                <TableHead className="hidden text-right @2xl:table-cell">Gasto fijo</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...filas].reverse().map((f, i) => (
                <TableRow key={f.mes} index={i} className="border-border">
                  <TableCell>
                    <span className="font-medium text-fg">{f.mes}</span>
                    {f.partida && <span className="block text-[11px] text-fg-muted">Punto de partida</span>}
                    {f.enCurso && <span className="block text-[11px] text-fg-muted">Al 6 de noviembre</span>}
                  </TableCell>
                  <TableCell className="tabular text-right font-medium text-fg">{pct(f.cobrado)}</TableCell>
                  <TableCell className="tabular hidden text-right @2xl:table-cell">{money(f.recaudado)}</TableCell>
                  <TableCell className="tabular hidden text-right @2xl:table-cell">{money(f.gasto)}</TableCell>
                  <TableCell className="text-right">
                    <Resultado f={f} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
