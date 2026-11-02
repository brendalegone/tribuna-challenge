import { CUOTA, RESTO, TOTAL_CUOTAS, type Gastos } from './data'
import type { DemoState } from './script'
import type { MesEstado } from '@/components/shared/status'

export function totals(s: DemoState) {
  const listed = Object.values(s.cuotas)
  const pagadas = RESTO.pagadas + listed.filter((c) => c.status === 'pagada').length
  const revision = listed.filter((c) => c.status === 'revision').length
  const parciales = listed.filter((c) => c.status === 'parcial')
  const aCuenta = parciales.reduce((sum, c) => sum + (c.pagado ?? 0), 0)
  // Pendientes incluye las cuotas con pago parcial: todavía deben una parte.
  const pendientes = TOTAL_CUOTAS - pagadas - revision
  const recaudado = pagadas * CUOTA + aCuenta
  const esperado = TOTAL_CUOTAS * CUOTA
  return {
    total: TOTAL_CUOTAS,
    pagadas,
    revision,
    parciales: parciales.length,
    pendientes,
    recaudado,
    esperado,
    faltaCuotas: TOTAL_CUOTAS - pagadas,
    falta: esperado - recaudado,
    porCobrar: pendientes * CUOTA - aCuenta,
  }
}

export const gastoTotal = (g: Gastos) => g.reduce((sum, item) => sum + item.monto, 0)

export function estadoMes(recaudado: number, esperado: number, gasto: number): MesEstado {
  if (recaudado >= gasto) return 'alcanza'
  if (esperado >= gasto) return 'riesgo'
  return 'no-alcanza'
}

export const pendingExceptions = (s: DemoState) => Object.values(s.excepciones).filter((e) => e === 'pendiente').length
