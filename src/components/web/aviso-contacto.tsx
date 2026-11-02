import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconMessageCircle as Message, IconPhone as Phone, IconClipboardCheck as Clipboard } from '@tabler/icons-react'
import { spring } from '@/lib/motion'
import { cn, money } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioItem } from '@/components/ui/radio-group'
import { DatePicker } from '@/components/ui/date-picker'
import { es } from '@daypicker/react/locale'
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CUOTA, type Cuota, type Grupo, type Socio } from '@/demo/data'
import { setAcuerdo, type Acuerdo } from '@/demo/script'

type Tipo = 'fecha' | 'partes' | 'pausa'

const ddmm = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`
/** Fechas de las partes: el 20/11 y cada 15 días. */
const FECHAS_PARTES = ['20/11', '5/12', '20/12']

/** Reparte la cuota en partes redondeadas a $100; la última absorbe la diferencia. */
function partes(n: number) {
  const base = Math.round(CUOTA / n / 100) * 100
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? CUOTA - base * (n - 1) : base))
}

/** Etiqueta de un campo, en el estilo de Fluid: arriba, chica y con peso medio. */
function Label({ htmlFor, children, opcional }: { htmlFor?: string; children: React.ReactNode; opcional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-fg">
      {children}
      {opcional && <span className="font-normal text-fg-muted"> (opcional)</span>}
    </label>
  )
}

/** Franja en Cuotas: un responsable pidió hablar con la tesorería. */
export function AvisoContacto({
  g,
  socio,
  cuota,
  activeAction,
  onAction,
}: {
  g: Grupo
  socio: Socio
  cuota: Cuota
  activeAction?: string
  onAction: (a: string) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const [tipo, setTipo] = useState<Tipo>('fecha')
  const [fecha, setFecha] = useState<Date | undefined>(new Date(2026, 10, 20))
  const [cantidad, setCantidad] = useState('2')
  const [notas, setNotas] = useState('')
  const ref = useRef<HTMLElement>(null)
  const cierreCalendario = useRef(0)
  const calendarioAbierto = useRef(false)
  const notasId = useId()
  const fechaId = useId()
  const nombre = socio.nombre.split(' ')[0]
  const responsable = g.responsable.split(' ')[0]
  const llamada = cuota.contacto === 'llamada'
  const container = ref.current?.closest<HTMLElement>('[data-web-root]') ?? null
  // En celular el popup va a pantalla completa (fuera del marco de la web)
  const enCelular = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  const n = Number(cantidad)
  const montos = partes(n)

  // Cada vez que el recorrido vuelve a este punto, se parte del acuerdo por defecto.
  useEffect(() => setAcuerdo(null), [])

  const guardar = () => {
    let acuerdo: Acuerdo
    if (tipo === 'fecha' && fecha) {
      acuerdo = {
        etiqueta: `Paga el ${ddmm(fecha)}`,
        lineas: [
          `Hola, ${responsable}. Como hablaste con Marta, te esperamos con la cuota de **${nombre}** hasta el **${ddmm(fecha)}**. 🧡`,
          'Te lo recordamos el día anterior. ¡Saludos!',
        ],
      }
    } else if (tipo === 'partes') {
      // En el chat, los montos van como en el resto de los mensajes: «$11.500»
      const items = montos.map((m, i) => `${money(m).replace(/\s/g, '')} el ${FECHAS_PARTES[i]}`)
      const detalle = `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
      acuerdo = {
        etiqueta: `En ${n} partes`,
        lineas: [
          `Hola, ${responsable}. Como hablaste con Marta, la cuota de **${nombre}** queda en **${n} partes**: ${detalle}. 🧡`,
          'Te lo recordamos un día antes de cada fecha. ¡Saludos!',
        ],
      }
    } else {
      acuerdo = {
        etiqueta: 'Recordatorios en pausa',
        lineas: [
          `Hola, ${responsable}. Como hablaste con Marta, este mes no te vamos a mandar recordatorios por la cuota de **${nombre}**. 🧡`,
          'Cuando quieras, escribinos por acá. ¡Saludos!',
        ],
      }
    }
    setAcuerdo(acuerdo)
    setAbierto(false)
    onAction('acuerdo')
  }

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.moderate}
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Message className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-fg">
            {g.responsable} {llamada ? 'prefiere que lo llamen' : 'pidió hablar con la tesorería'}
          </p>
          <p className="text-[13px] text-fg-muted">Responsable de {nombre} · Respondió el recordatorio: «Estoy complicado este mes».</p>
          {llamada && g.telefono && (
            <p className="mt-2 flex items-center gap-1.5 text-[15px] font-semibold text-fg">
              <Phone className="size-4" aria-hidden />
              <span className="tabular">{g.telefono}</span>
            </p>
          )}
          {!llamada && <p className="mt-1 text-[13px] text-fg-muted">Esperando que elija cómo prefiere que lo contacten.</p>}
        </div>
      </div>

      {llamada && (
        <span className="relative inline-flex">
          <Button leadingIcon={Clipboard} onClick={() => setAbierto(true)}>
            Registrar acuerdo
          </Button>
          {activeAction === 'acuerdo' && !abierto && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -inset-1 rounded-[12px] ring-2 ring-brand/70"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          )}
        </span>
      )}

      {/* En celular, fondo oscuro detrás del popup */}
      {abierto && enCelular && <div aria-hidden className="fixed inset-0 z-40 bg-black/45" onClick={() => setAbierto(false)} />}
      {/* No modal: el calendario y el selector se abren fuera del popup y tienen que poder recibir clics */}
      <Dialog
        modal={false}
        open={abierto}
        onOpenChange={(o) => {
          // Escape cierra primero el calendario; el popup sigue abierto.
          if (!o && (calendarioAbierto.current || Date.now() - cierreCalendario.current < 150)) return
          setAbierto(o)
        }}
      >
        <DialogContent container={enCelular ? null : container} size="lg">
          <DialogHeader>
            <DialogTitle>¿Qué acordaste con {responsable}?</DialogTitle>
            {/* Una sola bajada, mismo tamaño y peso en las dos oraciones */}
            <DialogDescription>
              {g.responsable} debe la cuota de noviembre de {nombre}: {money(CUOTA)}, vencida el 10/11. {responsable} va a recibir el detalle de este
              acuerdo por WhatsApp.
            </DialogDescription>
          </DialogHeader>

          {/* Tres bloques con el mismo espacio entre sí. El alto total es fijo:
              el espacio que sobra queda abajo, antes de los botones. */}
          <div data-cuerpo className="flex min-h-[404px] flex-col">
          <RadioGroup value={tipo} onValueChange={(v) => setTipo(v as Tipo)} className="w-full" aria-label="Tipo de acuerdo">
            <RadioItem index={0} value="fecha" label="Paga en una fecha" />
            <RadioItem index={1} value="partes" label="Paga en partes" />
            <RadioItem index={2} value="pausa" label="Solo pausar los recordatorios este mes" />
          </RadioGroup>

          <div className="mt-4 border-t border-border py-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tipo}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={spring.fast}
              >
                {tipo === 'fecha' && (
                  <div>
                    <Label htmlFor={fechaId}>¿Qué día paga?</Label>
                    <DatePicker
                      id={fechaId}
                      value={fecha}
                      onValueChange={setFecha}
                      locale="es-AR"
                      calendarProps={{ locale: es, weekStartsOn: 1 }}
                      clearable={false}
                      onOpenChange={(o) => {
                        calendarioAbierto.current = o
                        if (!o) cierreCalendario.current = Date.now()
                      }}
                      placeholder="Elegí una fecha"
                      aria-label="Fecha de pago"
                      className="w-56"
                    />
                    <p className="mt-2 text-[12px] text-fg-muted">Le mandamos un recordatorio el día anterior. Hasta entonces, ninguno.</p>
                  </div>
                )}
                {tipo === 'partes' && (
                  <div className="space-y-4">
                    <div>
                      <Label>¿En cuántas partes?</Label>
                      <Select value={cantidad} onValueChange={setCantidad}>
                        <SelectTrigger className="w-full" aria-label="Cantidad de partes" />
                        <SelectContent container={enCelular ? null : container}>
                          <SelectItem index={0} value="2">
                            2 partes
                          </SelectItem>
                          <SelectItem index={1} value="3">
                            3 partes
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="mb-1.5 text-[13px] font-medium text-fg">Así queda</p>
                      <ol className="space-y-1 text-[13px]">
                        {montos.map((m, i) => (
                          <li key={i} className="flex justify-between gap-3 tabular">
                            <span className="text-fg-muted">
                              {i + 1}ª parte · {FECHAS_PARTES[i]}
                            </span>
                            <span className="font-medium text-fg">{money(m)}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
                {tipo === 'pausa' && (
                  <div className="rounded-lg bg-muted p-3 text-[13px] text-fg-muted">
                    No le mandamos recordatorios hasta fin de mes. La cuota sigue pendiente y podés registrar un acuerdo de pago más adelante.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-border pt-4">
            <Label htmlFor={notasId} opcional>
              Notas para la tesorería
            </Label>
            <textarea
              id={notasId}
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej.: cobra a fin de mes, prefiere que lo llamen a la tarde"
              className={cn(
                'block w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-[13px] leading-5 text-fg',
                'transition-colors duration-80 placeholder:text-fg-subtle hover:bg-hover',
                'focus:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)]',
              )}
            />
          </div>
          </div>

          <DialogFooter>
            <Button variant="tertiary" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={tipo === 'fecha' && !fecha}>
              Guardar acuerdo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.section>
  )
}
