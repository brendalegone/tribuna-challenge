import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconPhoto as FileImage, IconMicrophone as Mic, IconPaperclip as Clip, IconDevices as MonitorSmartphone, IconChecks as CheckCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'
import { CLUB } from '@/demo/data'
import type { ChatMsg, PhoneOwner } from '@/demo/script'

/** Renderiza **negrita** dentro de una línea. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <strong key={i} className="font-semibold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export function ClubAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-club font-bold text-club-fg"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {CLUB.iniciales}
    </div>
  )
}

function Typing() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={spring.fast}
      className="flex w-fit gap-1 rounded-2xl rounded-tl-md bg-bubble-in px-3.5 py-3 shadow-soft"
      aria-label="El club está escribiendo"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-fg-subtle"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </motion.div>
  )
}

function Bubble({
  msg,
  activeAction,
  onAction,
}: {
  msg: ChatMsg
  activeAction?: string
  onAction: (a: string) => void
}) {
  const isUser = msg.from === 'user'
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring.moderate}
      className={cn('flex max-w-[86%] flex-col', isUser ? 'self-end items-end' : 'self-start items-start')}
    >
      <div
        className={cn(
          'overflow-hidden rounded-2xl text-[14px] leading-[1.45] text-fg shadow-soft',
          isUser ? 'rounded-tr-md bg-bubble-out' : 'rounded-tl-md bg-bubble-in',
        )}
      >
        {msg.attachment && (
          <div className="m-1 flex items-center gap-3 rounded-xl bg-muted p-3">
            <div className="grid size-10 place-items-center rounded-lg bg-accent text-fg-muted">
              <FileImage className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{msg.attachment.nombre}</p>
              <p className="text-xs text-fg-muted">{msg.attachment.detalle}</p>
            </div>
          </div>
        )}
        {msg.lines && (
          <div className="space-y-1.5 px-3.5 py-2.5">
            {msg.lines.map((l, i) => (
              <p key={i}>
                <Rich text={l} />
              </p>
            ))}
          </div>
        )}
        <div className={cn('flex items-center justify-end gap-1 px-3 pb-1.5 text-[11px] text-fg-subtle', msg.lines ? '-mt-1.5' : '')}>
          {isUser && <CheckCheck className="size-3.5 text-brand-text" aria-label="Leído" />}
        </div>
        {msg.buttons && (
          <div className="divide-y divide-border border-t border-border">
            {msg.buttons.map((b) => {
              // Activos: la acción del paso y las demás opciones del mismo mensaje (para explorar).
              const live = b.action === activeAction || msg.buttons!.some((x) => x.action === activeAction)
              return (
                <button
                  key={b.action}
                  onClick={() => onAction(b.action)}
                  disabled={!live}
                  className={cn(
                    'relative flex h-11 w-full cursor-pointer items-center justify-center text-[14px] font-medium transition-colors',
                    'disabled:cursor-default disabled:text-fg-subtle',
                    live && 'hover:bg-muted',
                    live && b.primary ? 'text-brand-text' : 'text-fg-muted',
                  )}
                >
                  {b.label}
                  {live && b.action === activeAction && (
                    <motion.span
                      className="absolute inset-1 rounded-lg ring-2 ring-brand/50"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      aria-hidden
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function Phone({
  owner,
  messages,
  activeAction,
  onAction,
  className,
}: {
  owner: PhoneOwner | null
  messages: ChatMsg[]
  activeAction?: string
  onAction: (a: string) => void
  className?: string
}) {
  const [visible, setVisible] = useState(messages.length)
  const [typing, setTyping] = useState(false)
  const visibleRef = useRef(visible)
  const ownerRef = useRef(owner?.id)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Revela los mensajes nuevos uno a uno, con "escribiendo…" antes de los del club.
  useEffect(() => {
    const ownerChanged = ownerRef.current !== owner?.id
    ownerRef.current = owner?.id
    let start = ownerChanged ? 0 : visibleRef.current
    if (messages.length <= start) {
      visibleRef.current = messages.length
      setVisible(messages.length)
      setTyping(false)
      return
    }
    if (ownerChanged) {
      visibleRef.current = 0
      setVisible(0)
    }
    const timers: number[] = []
    let t = 250
    for (let i = start; i < messages.length; i++) {
      const isClub = messages[i].from === 'club'
      if (isClub) {
        timers.push(window.setTimeout(() => setTyping(true), t))
        t += 750
      } else {
        t += 200
      }
      const n = i + 1
      timers.push(
        window.setTimeout(() => {
          setTyping(false)
          visibleRef.current = n
          setVisible(n)
        }, t),
      )
      t += 250
    }
    return () => timers.forEach(clearTimeout)
  }, [messages, owner?.id])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [visible, typing])

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <AnimatePresence mode="wait">
        <motion.p
          key={owner?.id ?? 'none'}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={spring.fast}
          className="max-w-full truncate text-center text-[13px] text-fg-muted"
        >
          {owner ? (
            <>
              Celular de <span className="font-semibold text-fg">{owner.nombre}</span> · {owner.rol}
            </>
          ) : (
            'Comisión directiva'
          )}
        </motion.p>
      </AnimatePresence>

      <div className="relative flex w-[300px] max-w-full shrink-0 flex-col rounded-[44px] bg-neutral-900 p-2.5 shadow-card ring-1 ring-white/15 md:min-h-0 md:flex-1 md:max-h-[640px] dark:bg-neutral-800">
        <div className="flex h-[620px] flex-col overflow-hidden rounded-[36px] bg-chat-bg md:h-auto md:min-h-0 md:flex-1">
          {/* barra de estado */}
          <div className="flex h-9 shrink-0 items-center justify-between px-7 pt-1 text-[12px] font-semibold text-fg">
            <span className="tabular">9:41</span>
            <span className="h-5 w-20 rounded-full bg-neutral-900 dark:bg-neutral-800" aria-hidden />
            <span className="flex gap-1" aria-hidden>
              <span className="h-2.5 w-4 rounded-sm border border-fg/60" />
            </span>
          </div>

          {/* encabezado del chat */}
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-2.5">
            <ClubAvatar />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold">{CLUB.nombre}</p>
              <p className="text-xs text-fg-muted">WhatsApp oficial del club</p>
            </div>
          </div>

          {/* mensajes */}
          <div ref={scrollRef} className="thin-scroll flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
            {owner ? (
              <>
                <p className="mx-auto mb-1 rounded-full bg-card/80 px-3 py-1 text-[11px] font-medium text-fg-muted">Hoy</p>
                {messages.slice(0, visible).map((m) => (
                  <Bubble key={m.id} msg={m} activeAction={activeAction} onAction={onAction} />
                ))}
                <AnimatePresence>{typing && <Typing />}</AnimatePresence>
              </>
            ) : (
              <div className="m-auto flex max-w-[240px] flex-col items-center gap-3 text-center">
                <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-text">
                  <MonitorSmartphone className="size-6" aria-hidden />
                </div>
                <p className="text-sm text-fg-muted">
                  La comisión no usa el chat. Todo lo que necesita saber está en la web de Tribuna.
                </p>
              </div>
            )}
          </div>

          {/* barra de escritura: el clip se activa cuando el paso pide mandar un archivo */}
          <div className="flex shrink-0 items-center gap-2 bg-card px-3 py-2.5">
            {activeAction === 'adjuntar' ? (
              <button
                onClick={() => onAction('adjuntar')}
                aria-label="Adjuntar el comprobante"
                className="relative grid size-8 cursor-pointer place-items-center rounded-full bg-brand text-white"
              >
                <Clip className="size-[18px]" />
                <motion.span
                  className="absolute -inset-1 rounded-full ring-2 ring-brand/60"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  aria-hidden
                />
              </button>
            ) : (
              <span className="grid size-8 place-items-center" aria-hidden>
                <Clip className="size-5 text-fg-subtle" />
              </span>
            )}
            <div className="h-9 flex-1 rounded-full bg-muted px-4 text-[13px] leading-9 text-fg-subtle" aria-hidden>Mensaje</div>
            <Mic className="size-5 text-fg-subtle" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}
