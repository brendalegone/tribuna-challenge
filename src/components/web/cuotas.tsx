import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { IconSearch as Search, IconCash as Banknote, IconArrowsLeftRight as ArrowLeftRight, IconWallet as Wallet, IconRefresh as RefreshCw, IconUsers as Users } from '@tabler/icons-react'
import { cn, money } from '@/lib/utils'
import { spring } from '@/lib/motion'
import { StatusBadge, type CuotaStatus } from '@/components/shared/status'
import { ValueTabs } from '@/components/shared/value-tabs'
import { InputGroup, InputField } from '@/components/ui/input-group'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { AvisoContacto } from './aviso-contacto'
import { Badge } from '@/components/ui/badge'
import { CUOTA, GRUPOS, MES, type Canal } from '@/demo/data'
import type { DemoState } from '@/demo/script'
import { totals } from '@/demo/totals'

const canalInfo: Record<Canal, { label: string; Icon: typeof Banknote }> = {
  efectivo: { label: 'Efectivo', Icon: Banknote },
  transferencia: { label: 'Transferencia', Icon: ArrowLeftRight },
  billetera: { label: 'Billetera', Icon: Wallet },
}

type Filtro = 'todas' | CuotaStatus

function Stat({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: string }) {
  return (
    <Card className="border border-border/60 bg-card p-4">
      <p className="text-[13px] text-fg-muted">{label}</p>
      <p className={cn('tabular mt-1 text-2xl font-semibold tracking-tight', tone)}>{value}</p>
      {sub && <div className="mt-2 text-xs text-fg-muted">{sub}</div>}
    </Card>
  )
}

export function CuotasView({ state, activeAction, onAction }: { state: DemoState; activeAction?: string; onAction: (a: string) => void }) {
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const t = totals(state)
  // Si un paso cambió una cuota que está más abajo en la lista, la llevamos a la vista.
  const destacado = state.highlight[0]
  useEffect(() => {
    if (!destacado) return
    const t = window.setTimeout(() => {
      document.querySelector(`[data-socio="${destacado}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 450)
    return () => window.clearTimeout(t)
  }, [destacado])
  const pidieron = GRUPOS.flatMap((g) => g.socios.filter((x) => state.cuotas[x.id].pidioHablar).map((socio) => ({ g, socio })))
  const pct = t.pagadas / t.total

  const grupos = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\./g, '')
    const nq = norm(q.trim())
    return GRUPOS.map((g) => ({
      ...g,
      socios: g.socios.filter((s) => {
        const st = state.cuotas[s.id].status
        // «Pendientes» incluye los pagos parciales: todavía deben una parte.
        if (filtro === 'pendiente' ? !['pendiente', 'parcial', 'vencida'].includes(st) : filtro !== 'todas' && st !== filtro) return false
        if (!nq) return true
        return norm(s.nombre).includes(nq) || norm(g.responsable).includes(nq) || norm(s.dni).includes(nq)
      }),
    })).filter((g) => g.socios.length > 0)
  }, [q, filtro, state.cuotas])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight @lg:text-2xl">Cuotas de {MES.toLowerCase()}</h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            {state.vencido ? 'Vencieron el 10/11' : 'Vencen el 10/11'} · Cuota social {money(CUOTA)}
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-fg-muted">
          <RefreshCw className="size-3.5" aria-hidden /> Actualizado hace instantes
        </p>
      </div>

      {/* Quien avisó que está complicado: lo ve solo la tesorería */}
      {pidieron.map(({ g, socio }) => (
        <AvisoContacto key={socio.id} g={g} socio={socio} cuota={state.cuotas[socio.id]} activeAction={activeAction} onAction={onAction} />
      ))}

      <div className="grid grid-cols-1 gap-3 @md:grid-cols-3">
        <Stat
          label="Confirmadas"
          value={
            <>
              {t.pagadas} <span className="text-base font-medium text-fg-muted">de {t.total}</span>
            </>
          }
          sub={
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full rounded-full bg-success" animate={{ width: `${pct * 100}%` }} transition={spring.slow} />
              </div>
              <span className="tabular font-medium text-fg">{Math.round(pct * 100)}%</span>
            </div>
          }
        />
        <Stat label="En revisión" value={t.revision} sub="Comprobante recibido, falta verificar" tone={t.revision ? 'text-warning' : undefined} />
        <Stat label="Pendientes" value={t.pendientes} sub={`${money(t.porCobrar)} por cobrar${t.parciales ? ` · ${t.parciales} con pago parcial` : ''}`} />
      </div>

      <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <InputGroup className="w-full @2xl:w-80">
          <InputField
            index={0}
            label="Buscar socio"
            labelHidden
            icon={Search}
            placeholder="Nombre, responsable o DNI"
            value={q}
            onChange={setQ}
          />
        </InputGroup>
        <div className="min-w-0">
          <ValueTabs<Filtro>
            ariaLabel="Filtrar por estado"
            value={filtro}
            onChange={setFiltro}
            options={[
              { value: 'todas', label: 'Todas' },
              { value: 'pagada', label: 'Pagadas' },
              { value: 'revision', label: 'En revisión' },
              { value: 'pendiente', label: 'Pendientes' },
            ]}
          />
        </div>
      </div>

      <Card className="border border-border/60 bg-card p-0">
        {grupos.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-fg-muted">No encontramos socios con esa búsqueda.</p>
        ) : (
          <div className="px-2 pb-2 @lg:px-3">
            {/* Anchos fijos: las columnas no se mueven al filtrar o buscar */}
            <Table className="table-fixed">
              <colgroup>
                <col />
                <col className="hidden w-[120px] @3xl:table-column" />
                <col className="hidden w-[110px] @3xl:table-column" />
                <col className="hidden w-[150px] @3xl:table-column" />
                <col className="w-[132px]" />
              </colgroup>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Socio</TableHead>
                  <TableHead className="hidden @3xl:table-cell">DNI</TableHead>
                  <TableHead className="hidden text-right @3xl:table-cell">Monto</TableHead>
                  <TableHead className="hidden @3xl:table-cell">Canal</TableHead>
                  <TableHead className="text-right @3xl:text-left">Estado</TableHead>
                </TableRow>
              </TableHeader>
              {(() => {
                let i = 0
                return grupos.map((g) => {
                  const total = GRUPOS.find((x) => x.id === g.id)!.socios.length
                  return (
                    <TableBody key={g.id}>
                      {/* Encabezado del grupo familiar: quién paga y cuántas cuotas incluye */}
                      <tr className="relative z-10 border-y border-border bg-muted">
                        <td colSpan={5} className="py-2 pl-3">
                          <p className="flex items-center gap-1.5 text-[13px] text-fg-muted">
                            <Users className="size-4 shrink-0" aria-hidden />
                            <span className="font-semibold text-fg">{g.responsable}</span> ·{' '}
                            {g.responsableEsSocio ? 'Socio y responsable de pago' : 'Responsable de pago'} ·{' '}
                            <span className="tabular">
                              {total} {total === 1 ? 'cuota' : 'cuotas'}
                            </span>
                          </p>
                        </td>
                      </tr>
                      {g.socios.map((s) => {
                        const c = state.cuotas[s.id]
                        const hi = state.highlight.includes(s.id)
                        const canal = c.canal ? canalInfo[c.canal] : null
                        const index = i++
                        return (
                          <TableRow key={s.id} index={index} data-socio={s.id} className="relative border-border">
                            <TableCell className="pl-8">
                              {hi && (
                                <motion.span
                                  key={`${s.id}-${c.status}`}
                                  aria-hidden
                                  className="pointer-events-none absolute inset-0 -z-10 rounded-lg"
                                  initial={{ backgroundColor: 'var(--brand-soft)' }}
                                  animate={{ backgroundColor: 'rgba(0,0,0,0)' }}
                                  transition={{ duration: 2.4, ease: 'easeOut' }}
                                />
                              )}
                              <p className="flex items-center gap-2 font-medium text-fg">
                                <span className="truncate">{s.nombre}</span>
                                {c.pidioHablar && (
                                  <Badge color="amber" size="compact">
                                    Pidió hablar
                                  </Badge>
                                )}
                                {c.acuerdo && (
                                  <Badge color="blue" size="compact">
                                    Con acuerdo · {c.acuerdo}
                                  </Badge>
                                )}
                              </p>
                              <p className="truncate text-[12px] text-fg-muted">
                                {s.actividad} · {s.edad} años
                                <span className="@3xl:hidden">
                                  {' '}· {c.status === 'parcial' ? `${money(c.pagado ?? 0)} de ${money(CUOTA)}` : money(CUOTA)}
                                  {canal && ` · ${canal.label}`}
                                </span>
                              </p>
                            </TableCell>
                            <TableCell className="tabular hidden text-fg-muted @3xl:table-cell">{s.dni}</TableCell>
                            <TableCell className="tabular hidden text-right font-medium @3xl:table-cell">
                              {c.status === 'parcial' ? (
                                <>
                                  {money(c.pagado ?? 0)}
                                  <span className="block text-[11px] font-normal text-fg-muted">de {money(CUOTA)}</span>
                                </>
                              ) : (
                                money(CUOTA)
                              )}
                            </TableCell>
                            <TableCell className="hidden text-fg-muted @3xl:table-cell">
                              {canal ? (
                                <span className="flex items-center gap-1.5">
                                  <canal.Icon className="size-4" aria-hidden /> {canal.label}
                                </span>
                              ) : (
                                <span className="text-fg-subtle">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right @3xl:text-left">
                              <StatusBadge status={c.status} />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  )
                })
              })()}
            </Table>
          </div>
        )}
      </Card>
      <p className="text-center text-xs text-fg-subtle">Mostrando 13 de 214 grupos familiares (datos de ejemplo)</p>
    </div>
  )
}
