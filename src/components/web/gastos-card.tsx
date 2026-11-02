import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconPencil as Pencil, IconPlus as Plus, IconTrash as Trash } from '@tabler/icons-react'
import { cn, money } from '@/lib/utils'
import { spring } from '@/lib/motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { GastoItem, Gastos } from '@/demo/data'
import { gastoTotal } from '@/demo/totals'

const fmt = new Intl.NumberFormat('es-AR')

/** Una fila en modo edición. En hover (o con foco) el monto se corre a la izquierda y aparece el tacho. */
function FilaEditable({
  g,
  onChange,
  onAskRemove,
}: {
  g: GastoItem
  onChange: (g: GastoItem) => void
  onAskRemove: () => void
}) {
  const nombre = g.nombre || 'gasto'
  return (
    <div className="group relative flex items-center justify-between gap-3 py-2.5">
      {g.base ? (
        <span className="min-w-0 truncate text-[15px]">{g.nombre}</span>
      ) : (
        <input
          value={g.nombre}
          onChange={(e) => onChange({ ...g, nombre: e.target.value })}
          placeholder="Nombre del gasto"
          aria-label="Nombre del gasto"
          autoFocus={g.nombre === ''}
          className="h-9 min-w-0 flex-1 rounded-lg bg-transparent px-3 text-[15px] ring-1 ring-border transition-shadow duration-80 placeholder:text-fg-subtle focus:outline-none focus-visible:ring-[color:var(--focus-ring)]"
        />
      )}

      {/* el margen se anima: el monto se desliza y deja lugar al tacho */}
      <span
        className={cn(
          'relative shrink-0 transition-[margin] duration-200 ease-out',
          'group-hover:mr-11 group-focus-within:mr-11 [@media(hover:none)]:mr-11',
        )}
      >
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-subtle">$</span>
        <input
          inputMode="numeric"
          aria-label={`Monto de ${nombre}`}
          value={fmt.format(g.monto)}
          onChange={(e) => onChange({ ...g, monto: Number(e.target.value.replace(/\D/g, '')) || 0 })}
          className="tabular h-9 w-36 rounded-lg bg-card pl-7 pr-3 text-right text-[15px] font-medium ring-1 ring-border transition-shadow duration-80 hover:ring-[color:var(--foreground)]/20 focus:outline-none focus-visible:ring-[color:var(--focus-ring)]"
        />
      </span>

      <span
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 transition-[opacity,transform] duration-200 ease-out',
          'pointer-events-none translate-x-2 opacity-0',
          'group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100',
          'group-focus-within:pointer-events-auto group-focus-within:translate-x-0 group-focus-within:opacity-100',
          '[@media(hover:none)]:pointer-events-auto [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100',
        )}
      >
        <Button variant="ghost" size="icon" aria-label={`Quitar ${nombre}`} onClick={onAskRemove}>
          <Trash className="size-4" />
        </Button>
      </span>
    </div>
  )
}

export function GastosCard({
  gastos,
  setGastos,
  editable,
  pulse,
}: {
  gastos: Gastos
  setGastos: (g: Gastos) => void
  /** solo la comisión edita */
  editable: boolean
  /** señal del recorrido: el botón «Editar» late hasta que se usa */
  pulse: boolean
}) {
  const [borrador, setBorrador] = useState<Gastos | null>(null)
  const [usado, setUsado] = useState(false)
  const [quitar, setQuitar] = useState<GastoItem | null>(null)
  const rootRef = useRef<HTMLElement>(null)
  const editando = borrador !== null
  const lista = borrador ?? gastos

  // Mientras se edita, solo cambia el total de esta card. El resumen del mes
  // se actualiza al tocar «Listo».
  const empezar = () => {
    setBorrador(gastos)
    setUsado(true)
  }
  const listo = () => {
    setGastos(lista.filter((g) => g.base || g.nombre.trim() !== '' || g.monto > 0))
    setBorrador(null)
  }
  const cancelar = () => setBorrador(null)
  const cambiar = (g: GastoItem) => setBorrador(lista.map((x) => (x.id === g.id ? g : x)))
  const confirmarQuitar = () => {
    if (quitar) setBorrador(lista.filter((x) => x.id !== quitar.id))
    setQuitar(null)
  }

  const total = gastoTotal(lista)
  const totalSinQuitar = quitar ? total - quitar.monto : total
  // El diálogo se abre dentro de la web de Tribuna (respeta su modo claro/oscuro).
  const container = rootRef.current?.closest<HTMLElement>('[data-web-root]') ?? null
  // En celular el popup va a pantalla completa (fuera del marco de la web)
  const enCelular = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

  return (
    <section
      ref={rootRef}
      className={cn('relative rounded-xl border bg-card p-4 transition-colors @lg:p-5', editando ? 'border-brand/50' : 'border-border/60')}
    >
      <div className="flex min-h-9 items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold">Gasto fijo estimado por mes</h2>
        {!editable ? (
          <Badge color="gray">Lo carga la comisión</Badge>
        ) : editando ? (
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="compact" onClick={cancelar}>
              Cancelar
            </Button>
            <Button size="compact" onClick={listo}>
              Listo
            </Button>
          </div>
        ) : (
          <span className="relative inline-flex">
            <Button variant="tertiary" size="compact" leadingIcon={Pencil} onClick={empezar}>
              Editar
            </Button>
            {pulse && !usado && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute -inset-1 rounded-[12px] ring-2 ring-brand/70"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            )}
          </span>
        )}
      </div>

      <div className="mt-2 divide-y divide-border">
        <AnimatePresence initial={false}>
          {lista.map((g) => (
            <motion.div
              key={g.id}
              layout="position"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={spring.fast}
            >
              {editando ? (
                <FilaEditable g={g} onChange={cambiar} onAskRemove={() => setQuitar(g)} />
              ) : (
                <div className="flex min-h-14 items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate text-[15px]">{g.nombre}</span>
                  <span className="tabular text-[15px] font-medium">{money(g.monto)}</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {editando && (
          <div className="py-2">
            <Button
              variant="ghost"
              leadingIcon={Plus}
              className="-ml-3"
              onClick={() => setBorrador([...lista, { id: `g${Date.now()}`, nombre: '', monto: 0 }])}
            >
              Agregar gasto
            </Button>
          </div>
        )}
        <div className="flex items-center justify-between pt-3">
          <span className="text-[15px] font-semibold">Total</span>
          <span className="tabular text-[15px] font-semibold">{money(total)}</span>
        </div>
      </div>
      {editando && <p className="pt-2 text-[12px] text-fg-muted">Los cambios se aplican al resumen del mes cuando tocás «Listo».</p>}

      <Dialog open={quitar !== null} onOpenChange={(o) => !o && setQuitar(null)}>
        <DialogContent container={enCelular ? null : container} showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>¿Quitar «{quitar?.nombre || 'este gasto'}»?</DialogTitle>
            <DialogDescription>
              El gasto fijo pasa de {money(total)} a {money(totalSinQuitar)}. Se aplica al resumen cuando tocás «Listo».
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="tertiary" onClick={() => setQuitar(null)}>
              Cancelar
            </Button>
            <Button leadingIcon={Trash} onClick={confirmarQuitar} autoFocus>
              Quitar gasto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
