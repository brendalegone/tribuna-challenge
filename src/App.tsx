import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  IconArrowLeft as ArrowLeft,
  IconArrowRight as ArrowRight,
  IconRotate as RotateCcw,
  IconHandFinger as HandPointing,
  IconDeviceMobile as Smartphone,
  IconDeviceDesktop as Monitor,
  IconArrowsLeftRight as ArrowLeftRight,
  IconRefresh as RefreshCw,
  IconHelpCircle as HelpCircle,
  IconCircleCheckFilled as CheckFilled,
  IconPlayerPlay as Play,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { ValueTabs } from '@/components/shared/value-tabs'
import type { IconComponentProps } from '@/lib/icon-context'
import { TribunaMark } from '@/components/brand'
import { Phone } from '@/components/chat/phone'
import { WebApp } from '@/components/web/web-app'
import { FLOWS, STEPS, firstStepOf, stateAt, threadAt, type Role, type WebTab } from '@/demo/script'
import { GASTOS_INICIALES } from '@/demo/data'

export type Theme = 'light' | 'dark'
type Side = 'chat' | 'web'

const STAGE = '#171c27'
const INTRO_KEY = 'tribuna-intro-v1'

function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* el almacenamiento puede no estar disponible */
  }
}

const toastCopy: Record<string, string> = {
  'confirmar-mal': 'Marta escribió $2.300 por error: tocá «Corregir».',
  'corregir-persona': 'En este recorrido corregimos el monto.',
  'corregir-2': 'El monto ya está bien: tocá «Confirmar».',
  buscar: 'La búsqueda de otro socio queda fuera de este prototipo.',
  'pago-semana': 'En este recorrido Diego avisa que está complicado.',
  'por-mensaje': 'En este recorrido Diego elige que lo llamen. Por mensaje, la tesorera le escribe desde el WhatsApp del club.',
  'cambiar-tesorero': 'Al autorizar a un nuevo tesorero, todo el historial queda en el club, no en una persona.',
  'fuera-de-paso': 'Esta acción llega en otro paso del recorrido. Seguí la indicación de arriba.',
}

/* ───────── Piezas del shell ───────── */

/** Encabezado de cada zona sobre el escenario oscuro. La zona activa lleva «Mirá acá». */
function ZoneHeader({
  icon: Icon,
  title,
  active,
  tone,
  children,
}: {
  icon: typeof Smartphone
  title: string
  active: boolean
  tone: Side
  children?: React.ReactNode
}) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-3 px-1 pb-3">
      <div className="flex items-center gap-2.5">
        <span
          className={cn('grid size-8 shrink-0 place-items-center rounded-lg text-white', tone === 'chat' ? 'bg-[#334155]' : 'bg-[#4f39f6]')}
          aria-hidden
        >
          <Icon className="size-[17px]" />
        </span>
        <h2 className="text-[15px] font-semibold text-white">{title}</h2>
        <AnimatePresence>
          {active && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={spring.fast}
              className="flex items-center gap-1.5 rounded-full bg-[#4f39f6]/25 px-2.5 py-1 text-[11px] font-semibold text-[#c9c3ff]"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#a99dff]" />
                <span className="relative size-1.5 rounded-full bg-[#a99dff]" />
              </span>
              Mirá acá
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {children}
    </div>
  )
}

/** Conector entre las dos zonas: se anima cuando el chat actualiza la web. */
function SyncConnector({ flash }: { flash: number }) {
  return (
    <div className="relative hidden w-16 shrink-0 md:block" aria-hidden>
      <div className="absolute inset-y-10 left-1/2 border-l-2 border-dashed border-white/12" />
      <div className="sticky top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 pt-[38vh]">
        <div className="relative grid size-10 place-items-center rounded-full border border-white/10 bg-[#232a38] text-[#a9b0ff]">
          <ArrowLeftRight className="size-[18px]" />
          <AnimatePresence>
            {flash > 0 && (
              <motion.span
                key={flash}
                className="absolute inset-0 rounded-full ring-2 ring-[#7c86ff]"
                initial={{ opacity: 0.9, scale: 1 }}
                animate={{ opacity: 0, scale: 1.9 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
          {flash > 0 &&
            [0, 1, 2].map((i) => (
              <motion.span
                key={`${flash}-${i}`}
                className="absolute size-1.5 rounded-full bg-[#a9b0ff]"
                initial={{ x: -26, opacity: 0 }}
                animate={{ x: 26, opacity: [0, 1, 0] }}
                transition={{ duration: 0.9, delay: i * 0.18, ease: 'easeInOut' }}
              />
            ))}
        </div>
        <span className="w-16 text-center text-[11px] font-medium leading-tight text-white/45">Se sincronizan</span>
      </div>
    </div>
  )
}

/** Progreso del recorrido: un segmento por paso (se puede saltar a cualquiera). */
function StepProgress({ total, current, onJump }: { total: number; current: number; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Pasos del recorrido">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          aria-label={`Ir al paso ${i + 1}`}
          aria-current={i === current ? 'step' : undefined}
          className="group grid h-4 cursor-pointer place-items-center"
        >
          <motion.span
            className={cn('block h-1.5 rounded-full', i <= current ? 'bg-[#4f39f6]' : 'bg-[#e4e4ea] group-hover:bg-[#cfcfd8]')}
            animate={{ width: i === current ? 28 : 14, opacity: i < current ? 0.45 : 1 }}
            transition={spring.fast}
          />
        </button>
      ))}
    </div>
  )
}

/** Indicación destacada de qué tocar y de qué lado. */
function HintPill({ text, side, required }: { text: string; side: Side; required: boolean }) {
  const SideIcon = side === 'chat' ? Smartphone : Monitor
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.fast}
      className={cn(
        'inline-flex h-8 max-w-full items-center gap-2 rounded-full pl-2 pr-3.5 text-[13px] font-semibold',
        required ? 'bg-[#4f39f6] text-white shadow-[0_4px_14px_-4px_rgba(79,57,246,0.6)]' : 'bg-[#efecff] text-[#4330e0]',
      )}
    >
      <span className={cn('grid size-5 shrink-0 place-items-center rounded-full', required ? 'bg-white/20' : 'bg-[#4f39f6]/12')}>
        <HandPointing className="size-3.5" aria-hidden />
      </span>
      <span className="truncate">{text}</span>
      <span className={cn('hidden shrink-0 items-center gap-1 text-[12px] font-medium sm:flex', required ? 'text-white/75' : 'text-[#4330e0]/70')}>
        · <SideIcon className="size-3.5" aria-hidden /> {side === 'chat' ? 'en el chat' : 'en la web'}
      </span>
    </motion.span>
  )
}

/** Ícono de la pestaña web con un punto: avisa que la web cambió desde el chat. */
function MonitorWithDot({ size = 16, className }: IconComponentProps) {
  return (
    <span className="relative inline-grid">
      <Monitor size={size} className={className} />
      <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#4f39f6] ring-2 ring-white" aria-label="actualizado" />
    </span>
  )
}

/** Pantalla de inicio: cómo leer el prototipo. Se muestra una vez. */
function Intro({ onStart }: { onStart: () => void }) {
  const items = [
    { Icon: Smartphone, title: 'A la izquierda, el WhatsApp del club', text: 'Lo que viven los socios y la tesorera desde su celular.' },
    { Icon: Monitor, title: 'A la derecha, la web de Tribuna', text: 'Lo que ven el tesorero y la comisión desde la compu.' },
    {
      Icon: HandPointing,
      title: 'Arriba, la historia paso a paso',
      text: 'Cuando haya algo para tocar, te lo marcamos. Si no, avanzá con «Siguiente» o con las flechas del teclado.',
    },
  ]
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0e121b]/75 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        transition={spring.moderate}
        className="w-full max-w-[480px] rounded-3xl bg-white p-6 text-[#17171c] shadow-2xl sm:p-8"
      >
        <TribunaMark />
        <h1 id="intro-title" className="mt-5 text-[22px] font-semibold leading-tight tracking-tight">
          Cobro y control de cuotas para clubes de barrio
        </h1>
        <p className="mt-2 text-[15px] text-[#5b5b66]">Un prototipo en 5 recorridos cortos. Así se lee la pantalla:</p>
        <ul className="mt-5 space-y-4">
          {items.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#efecff] text-[#4330e0]">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <div>
                <p className="text-[15px] font-semibold leading-snug">{title}</p>
                <p className="text-[14px] leading-snug text-[#5b5b66]">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-7 flex items-center justify-between gap-3">
          <span className="text-[13px] text-[#8a8a96]">5 recorridos · unos 4 minutos</span>
          <Button trailingIcon={Play} onClick={onStart} autoFocus>
            Empezar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Cierre de cada recorrido: qué se resolvió y a dónde seguir. */
function FlowDone({ flow, onReplay, onNext }: { flow: (typeof FLOWS)[number]; onReplay: () => void; onNext: () => void }) {
  const last = flow.n === FLOWS.length
  const nextFlow = FLOWS[flow.n]
  return (
    <motion.div
      className="absolute inset-0 z-40 grid place-items-center rounded-[28px] p-4"
      style={{ background: `color-mix(in srgb, ${STAGE} 82%, transparent)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="done-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        transition={spring.moderate}
        className="w-full max-w-[460px] rounded-3xl bg-white p-6 text-[#17171c] shadow-2xl sm:p-7"
      >
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#15803d]">
          <CheckFilled className="size-[18px]" aria-hidden /> Recorrido {flow.n} completo
        </p>
        <h2 id="done-title" className="mt-2 text-[22px] font-semibold leading-tight tracking-tight">
          {flow.doneTitle}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#5b5b66]">{flow.doneText}</p>
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <Button variant="tertiary" leadingIcon={RotateCcw} onClick={onReplay}>
            Ver de nuevo
          </Button>
          <Button trailingIcon={last ? RotateCcw : ArrowRight} onClick={onNext} autoFocus>
            {last ? 'Volver al inicio' : `Ir a «${nextFlow.title}»`}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ───────── App ───────── */

export default function App() {
  const [step, setStep] = useState(0)
  const [theme, setTheme] = useState<Theme>(() => (readStore('tribuna-theme') === 'dark' ? 'dark' : 'light'))
  const [tab, setTab] = useState<WebTab>(STEPS[0].web.tab)
  const [role, setRole] = useState<Role>(STEPS[0].web.role)
  const [panel, setPanel] = useState<Side>('chat')
  const [webDot, setWebDot] = useState(false)
  const [gastos, setGastos] = useState(GASTOS_INICIALES)
  const [toast, setToast] = useState<string | null>(null)
  const [flash, setFlash] = useState(0)
  const [syncChip, setSyncChip] = useState(false)
  const [intro, setIntro] = useState(() => readStore(INTRO_KEY) !== 'visto')
  const [done, setDone] = useState<number | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const chipTimer = useRef<number | undefined>(undefined)
  const prevStep = useRef(0)

  const current = STEPS[step]
  const state = useMemo(() => stateAt(step), [step])
  const thread = useMemo(() => threadAt(step), [step])
  const flowStart = firstStepOf(current.flow)
  const stepsOfFlow = STEPS.filter((s) => s.flow === current.flow)
  const stepInFlow = step - flowStart + 1
  const lastOfFlow = stepInFlow === stepsOfFlow.length
  const flowInfo = FLOWS[current.flow - 1]

  useEffect(() => writeStore('tribuna-theme', theme), [theme])

  // Cada paso define qué pestaña de la web, qué rol y qué lado está activo.
  useEffect(() => {
    setTab(current.web.tab)
    setRole(current.web.role)
    setPanel(current.focus)
    if (current.flow !== 4) setGastos(GASTOS_INICIALES)

    // Si el paso avanza y cambia datos, se anima la sincronización chat → web.
    const forward = step === prevStep.current + 1
    prevStep.current = step
    if (forward && current.effect) {
      setFlash((f) => f + 1)
      setSyncChip(true)
      setWebDot(current.focus === 'chat')
      window.clearTimeout(chipTimer.current)
      chipTimer.current = window.setTimeout(() => setSyncChip(false), 2800)
    } else {
      setSyncChip(false)
      setWebDot(false)
    }
  }, [step, current])

  const showToast = useCallback((key: string) => {
    setToast(toastCopy[key] ?? key)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const go = useCallback((i: number) => {
    setDone(null)
    setStep(Math.max(0, Math.min(STEPS.length - 1, i)))
  }, [])

  /** Avanzar: dentro del recorrido pasa al siguiente paso; al final, muestra el cierre. */
  const next = useCallback(() => {
    if (lastOfFlow) setDone(current.flow)
    else go(step + 1)
  }, [lastOfFlow, current.flow, go, step])

  const onAction = (a: string) => {
    if (a === current.waitFor) return next()
    if (toastCopy[a]) return showToast(a)
    showToast('fuera-de-paso')
  }

  const advance = useCallback(() => {
    if (current.waitFor) {
      // «Siguiente» también resuelve la acción pendiente, para no trabar a nadie.
      next()
    } else next()
  }, [current.waitFor, next])

  const closeIntro = () => {
    writeStore(INTRO_KEY, 'visto')
    setIntro(false)
  }

  // Flechas del teclado para avanzar y retroceder (útil al presentar).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (intro || e.altKey || e.metaKey || e.ctrlKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.closest('input, textarea, [contenteditable="true"], [role="tablist"], [role="switch"]') || t.isContentEditable)) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (done !== null) {
          if (done === FLOWS.length) go(0)
          else go(firstStepOf(done + 1))
        } else advance()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (done !== null) setDone(null)
        else go(step - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [intro, done, advance, go, step])

  const syncBadge = (
    <AnimatePresence>
      {syncChip && (
        <motion.span
          initial={{ opacity: 0, y: -4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={spring.fast}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#4f39f6] px-3 py-1.5 text-xs font-medium text-white"
          role="status"
        >
          <RefreshCw className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Actualizado desde WhatsApp</span>
          <span className="sm:hidden">Actualizado</span>
        </motion.span>
      )}
    </AnimatePresence>
  )

  // La zona que no participa del paso se atenúa: el ojo va directo a la activa.
  const zoneState = (side: Side) =>
    current.focus === side ? 'opacity-100' : 'md:opacity-45 md:saturate-[0.6] md:hover:opacity-90 md:hover:saturate-100'

  return (
    <div className="flex min-h-dvh flex-col text-[#17171c] md:h-dvh" style={{ background: STAGE }}>
      {/* ───── Guion de la demo (claro, para que resalte sobre el escenario) ───── */}
      <header className="relative z-10 shrink-0 bg-white shadow-[0_1px_0_#e4e4ea,0_8px_24px_-12px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 pt-3 md:px-6">
          <div className="flex items-center gap-3">
            <TribunaMark />
            <span className="hidden text-[13px] text-[#62626e] sm:inline">Prototipo · Challenge de diseño Conexa</span>
          </div>
          <div className="order-3 w-full min-w-0 px-1 lg:order-none lg:w-auto">
            <ValueTabs<string>
              ariaLabel="Elegir recorrido"
              value={String(current.flow)}
              onChange={(v) => go(firstStepOf(Number(v)))}
              options={FLOWS.map((f) => ({ value: String(f.n), label: `${f.n}. ${f.title}` }))}
            />
          </div>
          <div className="flex items-center gap-1">
            <Tooltip content="Volver al inicio">
              <Button variant="ghost" size="icon" onClick={() => go(0)} aria-label="Volver al inicio de la demo">
                <RotateCcw className="size-[18px]" />
              </Button>
            </Tooltip>
            <Tooltip content="Cómo leer el prototipo">
              <Button variant="ghost" size="icon" onClick={() => setIntro(true)} aria-label="Cómo leer el prototipo">
                <HelpCircle className="size-[18px]" />
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 pb-4 pt-3 md:flex-row md:items-end md:px-6">
          {/* Alto fijo en compu: el texto de cada paso no empuja ni achica el escenario */}
          <div className="min-w-0 flex-1 md:h-[100px]" aria-live="polite">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#62626e]">
                {flowInfo.title} · <span className="tabular">Paso {stepInFlow}</span> de {stepsOfFlow.length}
              </p>
              <StepProgress total={stepsOfFlow.length} current={stepInFlow - 1} onJump={(i) => go(flowStart + i)} />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={spring.fast}
              >
                <p className="mt-1.5 text-[17px] font-semibold leading-snug tracking-tight md:line-clamp-1">{current.caption}</p>
                <div className="mt-2 min-h-8">
                  {current.hint ? (
                    <HintPill text={current.hint} side={current.focus} required={!!current.waitFor} />
                  ) : (
                    current.why && <p className="text-[14px] leading-snug text-[#5b5b66] md:line-clamp-2">{current.why}</p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="tertiary" leadingIcon={ArrowLeft} onClick={() => go(step - 1)} disabled={step === 0}>
              Anterior
            </Button>
            <Button variant={current.waitFor ? 'tertiary' : 'primary'} trailingIcon={ArrowRight} onClick={advance}>
              {lastOfFlow ? 'Terminar recorrido' : 'Siguiente'}
            </Button>
          </div>
        </div>

        {/* En celular: una pestaña para cada mitad */}
        <div className="px-4 pb-3 md:hidden">
          <ValueTabs<Side>
            ariaLabel="Ver WhatsApp o la web"
            value={panel}
            onChange={(v) => {
              setPanel(v)
              if (v === 'web') setWebDot(false)
            }}
            options={[
              { value: 'chat', label: 'WhatsApp del club', icon: Smartphone },
              { value: 'web', label: 'Web de Tribuna', icon: webDot ? MonitorWithDot : Monitor },
            ]}
          />
        </div>
      </header>

      {/* ───── Escenario: WhatsApp del club | Web de Tribuna ───── */}
      <main className="relative mx-auto flex w-full max-w-[1600px] min-h-0 flex-1 p-3 md:p-5">
        <section
          aria-label="WhatsApp del club"
          className={cn(
            'w-full shrink-0 flex-col transition-[opacity,filter] duration-300 md:flex md:min-h-0 md:w-[316px]',
            panel === 'chat' ? 'flex' : 'hidden',
            zoneState('chat'),
          )}
        >
          <ZoneHeader icon={Smartphone} tone="chat" title="WhatsApp del club" active={current.focus === 'chat'} />
          <Phone
            className="md:min-h-0 md:flex-1 [&>p]:text-white/55 [&>p_span]:text-white"
            owner={current.owner}
            messages={thread}
            activeAction={current.waitFor}
            onAction={onAction}
          />
        </section>

        <SyncConnector flash={flash} />

        <section
          aria-label="Web de Tribuna"
          className={cn(
            'min-h-[78dvh] min-w-0 flex-1 flex-col transition-[opacity,filter] duration-300 md:flex md:min-h-0',
            panel === 'web' ? 'flex' : 'hidden',
            zoneState('web'),
          )}
        >
          <ZoneHeader icon={Monitor} tone="web" title="Web de Tribuna" active={current.focus === 'web'}>
            {syncBadge}
          </ZoneHeader>
          <div className="relative min-h-0 flex-1">
            <WebApp
              theme={theme}
              setTheme={setTheme}
              state={state}
              tab={tab}
              setTab={setTab}
              role={role}
              setRole={setRole}
              gastos={gastos}
              setGastos={setGastos}
              activeAction={current.waitFor}
              highlightGastos={current.flow === 4 && stepInFlow === 2}
              onAction={onAction}
            />
            <AnimatePresence>
              {flash > 0 && syncChip && (
                <motion.div
                  key={flash}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[22px]"
                  initial={{ boxShadow: '0 0 0 3px rgba(124,134,255,0.8)' }}
                  animate={{ boxShadow: '0 0 0 3px rgba(124,134,255,0)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
          </div>
        </section>

        <AnimatePresence>
          {done !== null && (
            <FlowDone
              key={done}
              flow={FLOWS[done - 1]}
              onReplay={() => go(firstStepOf(done))}
              onNext={() => go(done === FLOWS.length ? 0 : firstStepOf(done + 1))}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={spring.moderate}
            className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-md rounded-2xl bg-white px-4 py-3 text-center text-sm text-[#17171c] shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{intro && <Intro onStart={closeIntro} />}</AnimatePresence>
    </div>
  )
}
