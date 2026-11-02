// cn oficial de Fluid (entiende la escala tipográfica text-body, text-caption…)
export { cn } from './cn'

const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
export const money = (n: number) => ars.format(n).replace(/\s/g, ' ')

export const pct = (n: number) => `${Math.round(n * 100)}%`
