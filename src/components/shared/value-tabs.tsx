import { Tabs, TabsItem } from '@/components/ui/tabs'
import type { IconComponent } from '@/lib/icon-context'
import type { SizeVariant } from '@/lib/size-context'

export interface TabOption<T extends string> {
  value: T
  label: string
  icon?: IconComponent
}

/** Tabs oficiales de Fluid, controladas por valor en lugar de índice. */
export function ValueTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  size,
}: {
  options: TabOption<T>[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
  className?: string
  size?: SizeVariant
}) {
  const selected = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <Tabs aria-label={ariaLabel} selectedIndex={selected} onSelect={(i) => onChange(options[i].value)} className={className} size={size}>
      {options.map((o, i) => (
        <TabsItem key={o.value} index={i} label={o.label} icon={o.icon} />
      ))}
    </Tabs>
  )
}
