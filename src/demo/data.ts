import type { CuotaStatus } from '@/components/shared/status'

export const CLUB = {
  nombre: 'Club Villa Pueyrredón',
  corto: 'Villa Pueyrredón',
  iniciales: 'VP',
  alias: 'club.villapueyrredon',
}

export const TESORERA = { nombre: 'Marta Giménez', telefono: '+54 9 11 ••••-4821' }

export const CUOTA = 23000
export const TOTAL_CUOTAS = 300
export const MES = 'Noviembre'

export type Canal = 'efectivo' | 'transferencia' | 'billetera'

export interface Socio {
  id: string
  nombre: string
  edad: number
  actividad: string
  dni: string
}

export interface Grupo {
  id: string
  responsable: string
  /** el responsable de pago también es socio */
  responsableEsSocio: boolean
  telefono?: string
  socios: Socio[]
}

export interface Cuota {
  status: CuotaStatus
  canal?: Canal
  /** monto ya pagado cuando la cuota está en pago parcial */
  pagado?: number
  /** el responsable respondió que está pasando un momento difícil */
  pidioHablar?: boolean
  /** cómo prefiere que lo contacte la tesorería */
  contacto?: 'llamada' | 'mensaje'
  /** lo que acordó con la tesorería, p. ej. «Paga el 20/11» */
  acuerdo?: string
}

export const GRUPOS: Grupo[] = [
  {
    id: 'gomez',
    responsable: 'Ana Gómez',
    responsableEsSocio: false,
    socios: [
      { id: 'lucas', nombre: 'Lucas Gómez', edad: 11, actividad: 'Fútbol infantil', dni: '53.412.008' },
      { id: 'sofia', nombre: 'Sofía Gómez', edad: 9, actividad: 'Patín', dni: '55.120.731' },
    ],
  },
  {
    id: 'perez',
    responsable: 'Juan Pérez',
    responsableEsSocio: false,
    socios: [{ id: 'pedro', nombre: 'Pedro Pérez', edad: 10, actividad: 'Fútbol infantil', dni: '54.210.877' }],
  },
  {
    id: 'diaz',
    responsable: 'Roberto Díaz',
    responsableEsSocio: false,
    socios: [{ id: 'camila', nombre: 'Camila Díaz', edad: 14, actividad: 'Vóley', dni: '50.887.215' }],
  },
  {
    id: 'fernandez',
    responsable: 'Laura Fernández',
    responsableEsSocio: true,
    socios: [
      { id: 'laura', nombre: 'Laura Fernández', edad: 41, actividad: 'Gimnasia', dni: '29.341.556' },
      { id: 'tomas', nombre: 'Tomás Fernández', edad: 12, actividad: 'Básquet', dni: '52.661.043' },
      { id: 'valentina', nombre: 'Valentina Fernández', edad: 8, actividad: 'Patín', dni: '56.014.390' },
    ],
  },
  {
    id: 'sosa',
    responsable: 'Mónica Sosa',
    responsableEsSocio: true,
    socios: [
      { id: 'monica', nombre: 'Mónica Sosa', edad: 38, actividad: 'Yoga', dni: '31.008.442' },
      { id: 'martin', nombre: 'Martín Sosa', edad: 15, actividad: 'Fútbol', dni: '50.112.904' },
    ],
  },
  {
    id: 'acosta',
    responsable: 'Diego Acosta',
    responsableEsSocio: false,
    telefono: '11 5823-4417',
    socios: [{ id: 'bruno', nombre: 'Bruno Acosta', edad: 13, actividad: 'Básquet', dni: '51.776.320' }],
  },
  {
    id: 'rodriguez',
    responsable: 'Marcelo Rodríguez',
    responsableEsSocio: true,
    socios: [{ id: 'marcelo', nombre: 'Marcelo Rodríguez', edad: 55, actividad: 'Bochas', dni: '17.902.118' }],
  },
  {
    id: 'romero',
    responsable: 'Elena Romero',
    responsableEsSocio: true,
    socios: [{ id: 'elena', nombre: 'Elena Romero', edad: 67, actividad: 'Gimnasia adultos mayores', dni: '10.554.201' }],
  },
  {
    id: 'medina',
    responsable: 'Carolina Medina',
    responsableEsSocio: false,
    socios: [
      { id: 'joaquin', nombre: 'Joaquín Medina', edad: 7, actividad: 'Fútbol infantil', dni: '57.300.612' },
      { id: 'emma', nombre: 'Emma Medina', edad: 10, actividad: 'Patín', dni: '54.998.105' },
    ],
  },
  {
    id: 'benitez',
    responsable: 'Lucía Benítez',
    responsableEsSocio: true,
    socios: [{ id: 'lucia', nombre: 'Lucía Benítez', edad: 29, actividad: 'Vóley', dni: '38.450.773' }],
  },
  {
    id: 'herrera',
    responsable: 'Raúl Herrera',
    responsableEsSocio: true,
    socios: [{ id: 'raul', nombre: 'Raúl Herrera', edad: 71, actividad: 'Bochas', dni: '8.661.209' }],
  },
  {
    id: 'castro',
    responsable: 'Federico Castro',
    responsableEsSocio: true,
    socios: [{ id: 'federico', nombre: 'Federico Castro', edad: 33, actividad: 'Fútbol', dni: '34.112.987' }],
  },
  {
    id: 'ruiz',
    responsable: 'Carlos Ruiz',
    responsableEsSocio: true,
    socios: [{ id: 'carlos', nombre: 'Carlos Ruiz', edad: 48, actividad: 'Paddle', dni: '24.870.334' }],
  },
]

export const INITIAL_CUOTAS: Record<string, Cuota> = {
  lucas: { status: 'pendiente' },
  sofia: { status: 'pendiente' },
  pedro: { status: 'pendiente' },
  camila: { status: 'pendiente' },
  laura: { status: 'pendiente' },
  tomas: { status: 'pendiente' },
  valentina: { status: 'pendiente' },
  monica: { status: 'pagada', canal: 'transferencia' },
  martin: { status: 'pagada', canal: 'transferencia' },
  bruno: { status: 'pendiente' },
  marcelo: { status: 'pagada', canal: 'efectivo' },
  elena: { status: 'pagada', canal: 'efectivo' },
  joaquin: { status: 'pagada', canal: 'billetera' },
  emma: { status: 'pagada', canal: 'billetera' },
  lucia: { status: 'pagada', canal: 'billetera' },
  raul: { status: 'pendiente' },
  federico: { status: 'pagada', canal: 'billetera' },
  carlos: { status: 'pendiente' },
}

/** Cuotas de socios que no aparecen listados en la demo (para que los totales sean realistas). */
const LISTADOS = Object.keys(INITIAL_CUOTAS).length
const PAGADAS_LISTADAS = Object.values(INITIAL_CUOTAS).filter((c) => c.status === 'pagada').length
export const RESTO = {
  total: TOTAL_CUOTAS - LISTADOS,
  pagadas: 180 - PAGADAS_LISTADAS,
}

export interface Excepcion {
  id: string
  origen: string
  monto: number
  fecha: string
  comprobante: boolean
  sugerencia?: {
    grupoId: string
    socioIds: string[]
    texto: string
    motivo: string
    /** el monto es menor a la cuota: se registra como pago a cuenta */
    parcial?: boolean
  }
}

export const EXCEPCIONES: Excepcion[] = [
  {
    id: 'e1',
    origen: 'Roberto Díaz V.',
    monto: 23000,
    fecha: '5 nov · 18:42',
    comprobante: false,
    sugerencia: {
      grupoId: 'diaz',
      socioIds: ['camila'],
      texto: 'Camila Díaz · Vóley',
      motivo: 'El apellido coincide con el de su responsable de pago y el monto, con su cuota.',
    },
  },
  {
    id: 'e2',
    origen: 'L. Fernández',
    monto: 69000,
    fecha: '5 nov · 21:10',
    comprobante: true,
    sugerencia: {
      grupoId: 'fernandez',
      socioIds: ['laura', 'tomas', 'valentina'],
      texto: 'Grupo Fernández · 3 cuotas',
      motivo: 'El monto coincide con las 3 cuotas del grupo y llegó el comprobante. Como cubre varias cuotas, la primera vez lo confirma una persona.',
    },
  },
  {
    id: 'e3',
    origen: 'Carlos Ruiz',
    monto: 5000,
    fecha: '5 nov · 22:40',
    comprobante: false,
    sugerencia: {
      grupoId: 'ruiz',
      socioIds: ['carlos'],
      texto: 'Pago parcial · cuota de Carlos Ruiz',
      motivo: `El nombre coincide con un socio que tiene la cuota de noviembre pendiente. El monto es menor a la cuota: queda como pago a cuenta y le faltan ${'$'}18.000.`,
      parcial: true,
    },
  },
]

export interface GastoItem {
  id: string
  nombre: string
  monto: number
  /** los gastos de base no se pueden borrar */
  base?: boolean
}
export type Gastos = GastoItem[]

export const GASTOS_INICIALES: Gastos = [
  { id: 'servicios', nombre: 'Servicios', monto: 1900000, base: true },
  { id: 'sueldos', nombre: 'Sueldos', monto: 2900000, base: true },
  { id: 'mantenimiento', nombre: 'Mantenimiento', monto: 600000, base: true },
]

/** Meses cerrados desde que el club usa Tribuna. Agosto es el punto de partida. */
export interface MesCerrado {
  mes: string
  corto: string
  cobradas: number
  gasto: number
  /** % cobrado al día 6 de ese mes, para comparar a la misma altura */
  alDia6: number
  /** % de los pagos digitales que se confirmaron sin intervención */
  automatico: number
}
export const HISTORIAL: MesCerrado[] = [
  { mes: 'Agosto', corto: 'Ago', cobradas: 192, gasto: 4900000, alDia6: 0.41, automatico: 0.58 },
  { mes: 'Septiembre', corto: 'Sep', cobradas: 210, gasto: 5000000, alDia6: 0.49, automatico: 0.71 },
  { mes: 'Octubre', corto: 'Oct', cobradas: 228, gasto: 5200000, alDia6: 0.55, automatico: 0.78 },
]
