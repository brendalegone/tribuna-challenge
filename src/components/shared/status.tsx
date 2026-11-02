import { IconCircleCheck, IconClock, IconCircleDashed, IconAlertTriangle, IconCircleX, IconProgress } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'

export type CuotaStatus = 'pagada' | 'revision' | 'parcial' | 'pendiente' | 'vencida'
export type MesEstado = 'alcanza' | 'riesgo' | 'no-alcanza'
type BadgeColor = 'green' | 'amber' | 'gray' | 'red' | 'blue'

const statusMap: Record<CuotaStatus, { color: BadgeColor; label: string; Icon: typeof IconClock }> = {
  pagada: { color: 'green', label: 'Pagada', Icon: IconCircleCheck },
  revision: { color: 'amber', label: 'En revisión', Icon: IconClock },
  parcial: { color: 'blue', label: 'Pago parcial', Icon: IconProgress },
  pendiente: { color: 'gray', label: 'Pendiente', Icon: IconCircleDashed },
  vencida: { color: 'red', label: 'Vencida', Icon: IconAlertTriangle },
}

/** Estado siempre con ícono + texto: nunca solo color. Badge oficial de Fluid. */
export function StatusBadge({ status }: { status: CuotaStatus }) {
  const { color, label, Icon } = statusMap[status]
  return (
    <Badge color={color} className="[&>span:last-child]:inline-flex [&>span:last-child]:items-center [&>span:last-child]:gap-1 [&>span:last-child]:[text-box:none]">
      <Icon className="size-3.5" aria-hidden />
      {label}
    </Badge>
  )
}

export const mesEstadoMap: Record<MesEstado, { color: BadgeColor; label: string; Icon: typeof IconClock }> = {
  alcanza: { color: 'green', label: 'Alcanza', Icon: IconCircleCheck },
  riesgo: { color: 'amber', label: 'En riesgo', Icon: IconAlertTriangle },
  'no-alcanza': { color: 'red', label: 'No alcanza', Icon: IconCircleX },
}
