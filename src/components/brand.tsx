/** Marca de Tribuna: una tribuna simple (gradas + techo) en el color de acento. */
export function TribunaMark({ withText = true }: { withText?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="9" fill="var(--brand)" />
        <path
          d="M7 21h18M9 21v-5m7 5v-9m7 9v-5M7 12l9-5 9 5"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {withText && <span className="text-[17px] font-semibold tracking-tight">Tribuna</span>}
    </span>
  )
}
