import { INITIAL_CUOTAS, EXCEPCIONES, CLUB, type Cuota, type Canal } from './data'
import type { CuotaStatus } from '@/components/shared/status'

/* ───────── Estado de la demo ───────── */

/** «futuro»: el pago todavía no llegó en la historia (recorridos 1 y 2 pasan el 3/11). */
export type ExcepcionEstado = 'futuro' | 'pendiente' | 'asignada' | 'no-cuota'

export interface DemoState {
  cuotas: Record<string, Cuota>
  excepciones: Record<string, ExcepcionEstado>
  /** socios que cambiaron en el último paso (se resaltan en la web) */
  highlight: string[]
  /** ya pasó el vencimiento (10/11): las cuotas sin pagar figuran como «Vencida» */
  vencido?: boolean
}

export const initialState = (): DemoState => ({
  cuotas: structuredClone(INITIAL_CUOTAS),
  excepciones: Object.fromEntries(EXCEPCIONES.map((e) => [e.id, 'futuro' as ExcepcionEstado])),
  highlight: [],
})

const setCuotas =
  (ids: string[], status: CuotaStatus, canal?: Canal) =>
  (s: DemoState): DemoState => ({
    ...s,
    cuotas: { ...s.cuotas, ...Object.fromEntries(ids.map((id) => [id, { status, canal }])) },
    highlight: ids,
  })

const resolver =
  (excId: string, estado: ExcepcionEstado, socios: string[] = [], canal: Canal = 'billetera') =>
  (s: DemoState): DemoState => {
    const base = socios.length ? setCuotas(socios, 'pagada', canal)(s) : { ...s, highlight: [] }
    return { ...base, excepciones: { ...base.excepciones, [excId]: estado } }
  }

/** Pago menor a la cuota: se registra a cuenta y la cuota queda en «Pago parcial». */
const resolverParcial =
  (excId: string, socioId: string, monto: number) =>
  (s: DemoState): DemoState => ({
    ...s,
    cuotas: { ...s.cuotas, [socioId]: { status: 'parcial', canal: 'billetera', pagado: monto } },
    excepciones: { ...s.excepciones, [excId]: 'asignada' },
    highlight: [socioId],
  })

/** El responsable avisa que está complicado: la tesorería lo ve en la web (solo ella). */
const pideHablar =
  (socioId: string) =>
  (s: DemoState): DemoState => ({
    ...s,
    cuotas: { ...s.cuotas, [socioId]: { ...s.cuotas[socioId], pidioHablar: true } },
    // sin resaltar la fila: el aviso aparece arriba de todo en Cuotas
    highlight: [],
  })

const prefiere =
  (socioId: string, contacto: 'llamada' | 'mensaje') =>
  (s: DemoState): DemoState => ({
    ...s,
    cuotas: { ...s.cuotas, [socioId]: { ...s.cuotas[socioId], contacto } },
    highlight: [],
  })

/** Lo que la tesorera registra en el popup. Por defecto, «Paga el 20/11». */
export interface Acuerdo {
  /** etiqueta corta para la tabla de Cuotas */
  etiqueta: string
  /** mensaje que recibe el responsable por WhatsApp */
  lineas: string[]
}
const acuerdoPorDefecto: Acuerdo = {
  etiqueta: 'Paga el 20/11',
  lineas: [
    'Hola, Diego. Como hablaste con Marta, te esperamos con la cuota de **Bruno** hasta el **20/11**. 🧡',
    'Te lo recordamos el día anterior. ¡Saludos!',
  ],
}
let acuerdoActual: Acuerdo = acuerdoPorDefecto
export function setAcuerdo(a: Acuerdo | null) {
  acuerdoActual = a ?? acuerdoPorDefecto
}

/** La tesorera registra lo que acordaron: la cuota sigue pendiente, pero con un acuerdo. */
const acordar =
  (socioId: string) =>
  (s: DemoState): DemoState => ({
    ...s,
    cuotas: { ...s.cuotas, [socioId]: { ...s.cuotas[socioId], pidioHablar: false, acuerdo: acuerdoActual.etiqueta } },
    highlight: [socioId],
  })

/* ───────── Chat ───────── */

export interface ChatButton {
  action: string
  label: string
  primary?: boolean
}

export interface ChatMsg {
  id: string
  from: 'club' | 'user'
  /** líneas de texto; **negrita** soportada */
  lines?: string[]
  attachment?: { nombre: string; detalle: string }
  buttons?: ChatButton[]
}

export interface PhoneOwner {
  id: string
  nombre: string
  rol: string
}

const ANA: PhoneOwner = { id: 'ana', nombre: 'Ana Gómez', rol: 'Responsable de pago' }
const MARTA: PhoneOwner = { id: 'marta', nombre: 'Marta', rol: 'Tesorera' }
const JUAN: PhoneOwner = { id: 'juan', nombre: 'Juan Pérez', rol: 'Responsable de pago' }
const ROBERTO: PhoneOwner = { id: 'roberto', nombre: 'Roberto Díaz', rol: 'Responsable de pago' }
const DIEGO: PhoneOwner = { id: 'diego', nombre: 'Diego Acosta', rol: 'Responsable de pago' }
const CARLOS: PhoneOwner = { id: 'carlos', nombre: 'Carlos Ruiz', rol: 'Socio' }

/* ───────── Pasos ───────── */

export type WebTab = 'cuotas' | 'revisar' | 'resumen' | 'historial'
export type Role = 'tesorero' | 'comision'

export interface Step {
  flow: number
  owner: PhoneOwner | null
  caption: string
  /** por qué importa (texto secundario) */
  why?: string
  messages?: ChatMsg[]
  effect?: (s: DemoState) => DemoState
  /** acción (botón del chat o de la web) que avanza este paso */
  waitFor?: string
  hint?: string
  web: { tab: WebTab; role: Role }
  focus: 'chat' | 'web'
}

export const FLOWS = [
  {
    n: 1,
    title: 'Aviso y pago',
    short: 'Aviso y pago',
    doneTitle: 'Ana pagó sin ir al club',
    doneText: 'Recibió el aviso y transfirió. El pago se confirmó solo, con o sin comprobante, y la tesorera no tuvo que anotar nada.',
  },
  {
    n: 2,
    title: 'Pago en efectivo',
    short: 'Efectivo',
    doneTitle: 'El efectivo también queda registrado',
    doneText: 'Marta lo cargó desde su celular, corrigió su error antes de guardarlo y Juan recibió su comprobante. Efectivo y transferencias, en un mismo lugar.'
  },
  {
    n: 3,
    title: 'Pagos para revisar',
    short: 'Revisar',
    doneTitle: '3 pagos resueltos en menos de un minuto',
    doneText: 'Las sugerencias hacen el trabajo pesado y Marta solo confirma. El pago parcial de Carlos deja la deuda registrada y clara para los dos lados.',
  },
  {
    n: 4,
    title: '¿Alcanza el mes?',
    short: '¿Alcanza?',
    doneTitle: 'La comisión sabe si el mes alcanza',
    doneText: 'Sabe si este mes alcanza y cómo viene el club desde que usa Tribuna, sin pedirle la planilla al tesorero ni ver la situación de cada familia.',
  },
  {
    n: 5,
    title: 'Cuando alguien se atrasa',
    short: 'Atraso',
    doneTitle: 'Nadie tuvo que reclamarle a un vecino',
    doneText:
      'El club recordó la cuota, Diego pudo decir que está complicado sin exponerse, Marta lo llamó y el acuerdo quedó por escrito, antes de que deje de venir. Ese es el recorrido completo de Tribuna.',
  },
]

const tes = { tab: 'cuotas' as WebTab, role: 'tesorero' as Role }

export const STEPS: Step[] = [
  /* ── Flujo 1 · Aviso, pago y comprobante ── */
  {
    flow: 1,
    owner: ANA,
    caption: 'Ana recibe el primer mensaje del WhatsApp oficial del club.',
    why: 'Lo aceptó al asociar a sus hijos. Desde el primer mensaje, el club le da señales para confiar en el número.',
    web: tes,
    focus: 'chat',
    messages: [
      {
        id: 'f1-hola',
        from: 'club',
        lines: [
          `¡Hola, Ana! 👋 Este es el WhatsApp oficial del ${CLUB.nombre}. Vas a encontrar este mismo número en la cartelera del club y en nuestro Instagram.`,
          'Desde acá te vamos a avisar cuándo vence la cuota, y podés mandarnos el comprobante cuando pagues.',
          '**Nunca te vamos a pedir claves ni datos de tu tarjeta.**',
        ],
      },
    ],
  },
  {
    flow: 1,
    owner: ANA,
    caption: '3 de noviembre: llega el aviso con las cuotas de Lucas y Sofía.',
    why: 'Una semana antes del vencimiento y con el total del grupo familiar, no un mensaje por hijo.',
    web: tes,
    focus: 'chat',
    messages: [
      {
        id: 'f1-aviso',
        from: 'club',
        lines: [
          '¡Hola, Ana! Te recordamos la cuota de **noviembre**:',
          '• Lucas — $23.000',
          '• Sofía — $23.000',
          '**Total: $46.000** · vence el 10/11',
          `Podés pagar por transferencia al alias **${CLUB.alias}**`,
          'Cuando pagues, mandanos la captura del comprobante por acá y listo. 🧡',
        ],
      },
    ],
  },
  {
    flow: 1,
    owner: ANA,
    caption: 'Ana transfiere desde su billetera y el pago se confirma solo.',
    why: 'La plata llegó a la cuenta del club y coincide con lo que debe su grupo. La web se actualiza sin que el tesorero toque nada.',
    hint: 'Tocá el clip: Ana manda igual la captura',
    waitFor: 'adjuntar',
    web: tes,
    focus: 'chat',
    effect: setCuotas(['lucas', 'sofia'], 'pagada', 'billetera'),
    messages: [
      {
        id: 'f1-ok',
        from: 'club',
        lines: ['✅ ¡Listo, Ana! Confirmamos tu pago de **$46.000**.', 'Cuotas de noviembre de Lucas y Sofía: **al día**.', '¡Gracias por acompañar al club!'],
      },
    ],
  },
  {
    flow: 1,
    owner: ANA,
    caption: 'Ana manda la captura por costumbre: el club ya tenía el pago.',
    why: 'El comprobante suma, pero no es obligatorio. Si llegaba antes que la plata, la cuota pasaba a «En revisión» hasta confirmarse.',
    web: tes,
    focus: 'chat',
    messages: [
      { id: 'f1-comp', from: 'user', attachment: { nombre: 'comprobante.jpg', detalle: 'Transferencia · $46.000' } },
      {
        id: 'f1-yaestaba',
        from: 'club',
        lines: ['¡Gracias, Ana! Ya teníamos tu pago confirmado ✅', 'No hace falta que hagas nada más.'],
      },
    ],
  },

  /* ── Flujo 2 · Registro de efectivo (con corrección) ── */
  {
    flow: 2,
    owner: MARTA,
    caption: '4 de noviembre: Juan le paga en efectivo a Marta, que lo registra desde su celular.',
    why: 'Escribe el nombre de quien le pagó y el monto, como un mensaje más.',
    hint: 'Marta escribió mal el monto: tocá «Corregir»',
    waitFor: 'corregir',
    web: tes,
    focus: 'chat',
    messages: [
      { id: 'f2-marta', from: 'user', lines: ['Juan Pérez pagó 2300'] },
      {
        id: 'f2-reg',
        from: 'club',
        lines: ['Registramos este pago:', '**Pedro Pérez** · Fútbol infantil', 'Pagó: Juan Pérez (responsable)', 'Cuota de noviembre · **$2.300** en efectivo', '⚠️ Es menos que la cuota ($23.000): quedaría como pago parcial.'],
        buttons: [
          { action: 'confirmar-mal', label: 'Confirmar' },
          { action: 'corregir', label: 'Corregir', primary: true },
        ],
      },
    ],
  },
  {
    flow: 2,
    owner: MARTA,
    caption: 'Nada se registra hasta que Marta confirma: elige qué corregir.',
    why: 'Puede cambiar la persona o el monto sin empezar de nuevo.',
    hint: 'Tocá «El monto»',
    waitFor: 'corregir-monto',
    web: tes,
    focus: 'chat',
    messages: [
      { id: 'f2-corr', from: 'user', lines: ['Corregir'] },
      {
        id: 'f2-que',
        from: 'club',
        lines: ['¿Qué querés corregir?'],
        buttons: [
          { action: 'corregir-persona', label: 'La persona' },
          { action: 'corregir-monto', label: 'El monto', primary: true },
        ],
      },
    ],
  },
  {
    flow: 2,
    owner: MARTA,
    caption: 'Marta escribe el monto correcto y revisa el registro.',
    why: 'El club le devuelve el resumen completo antes de guardar nada.',
    hint: 'Tocá «Confirmar»',
    waitFor: 'confirmar',
    web: tes,
    focus: 'chat',
    messages: [
      { id: 'f2-monto', from: 'user', lines: ['El monto'] },
      { id: 'f2-pide', from: 'club', lines: ['Escribí el monto que te pagó Juan.'] },
      { id: 'f2-23', from: 'user', lines: ['23000'] },
      {
        id: 'f2-reg2',
        from: 'club',
        lines: ['Registramos este pago:', '**Pedro Pérez** · Fútbol infantil', 'Pagó: Juan Pérez (responsable)', 'Cuota de noviembre · **$23.000** en efectivo'],
        buttons: [
          { action: 'confirmar', label: 'Confirmar', primary: true },
          { action: 'corregir-2', label: 'Corregir' },
        ],
      },
    ],
  },
  {
    flow: 2,
    owner: MARTA,
    caption: 'Marta confirma: la cuota de Pedro pasa a «Pagada» en efectivo.',
    why: 'El efectivo queda en el mismo registro que las transferencias, sin el error de tipeo.',
    web: tes,
    focus: 'web',
    effect: setCuotas(['pedro'], 'pagada', 'efectivo'),
    messages: [
      { id: 'f2-conf', from: 'user', lines: ['Confirmar'] },
      { id: 'f2-ok', from: 'club', lines: ['✅ Registrado. Le avisamos a Juan que recibimos su pago.'] },
    ],
  },
  {
    flow: 2,
    owner: JUAN,
    caption: 'Juan recibe la confirmación en su celular.',
    why: 'Le sirve como comprobante. Y si Marta se hubiera equivocado de persona, quien la recibe lo nota enseguida.',
    web: tes,
    focus: 'chat',
    messages: [
      {
        id: 'f2-juan',
        from: 'club',
        lines: [
          '¡Hola, Juan! ✅ Registramos tu pago en efectivo de **$23.000** por la cuota de noviembre de **Pedro** (Fútbol infantil). Ya está al día.',
          'Si no reconocés este pago, respondé este mensaje.',
        ],
      },
    ],
  },

  /* ── Flujo 3 · Pagos para revisar ── */
  {
    flow: 3,
    owner: MARTA,
    caption: '6 de noviembre: Marta recibe un resumen con 3 pagos para revisar.',
    why: 'Un solo aviso por día, no uno por pago. No es urgente: la plata ya está en la cuenta del club.',
    hint: 'Tocá «Revisar pagos»',
    waitFor: 'revisar',
    web: tes,
    focus: 'chat',
    messages: [
      {
        id: 'f3-resumen',
        from: 'club',
        lines: [
          '¡Buen día, Marta! Hoy hay **3 pagos** que no pudimos asignar solos. Ya están en la cuenta del club; solo falta saber a quién corresponden.',
          'No es urgente: revisalos desde la compu cuando tengas un rato.',
        ],
        buttons: [{ action: 'revisar', label: 'Revisar pagos', primary: true }],
      },
    ],
  },
  {
    flow: 3,
    owner: MARTA,
    caption: 'Marta abre la web: cada pago trae una sugerencia y su motivo.',
    why: 'Ella solo confirma o corrige: no tiene que buscar en la planilla.',
    hint: 'Tocá «Asignar» en el pago de Roberto Díaz',
    waitFor: 'asignar-e1',
    web: { tab: 'revisar', role: 'tesorero' },
    focus: 'web',
  },
  {
    flow: 3,
    owner: MARTA,
    caption: 'El pago de Roberto queda asignado a Camila.',
    why: 'Con «Recordar esta cuenta», la próxima transferencia de Roberto se confirma sola.',
    hint: 'Tocá «Asignar» en el pago de L. Fernández',
    waitFor: 'asignar-e2',
    web: { tab: 'revisar', role: 'tesorero' },
    focus: 'web',
    effect: resolver('e1', 'asignada', ['camila'], 'transferencia'),
  },
  {
    flow: 3,
    owner: MARTA,
    caption: 'Una sola transferencia cubrió las 3 cuotas de los Fernández.',
    why: 'El sistema lo detecta porque sabe cuánto debe cada grupo familiar.',
    hint: 'Tocá «Asignar pago parcial» en el pago de Carlos',
    waitFor: 'asignar-e3',
    web: { tab: 'revisar', role: 'tesorero' },
    focus: 'web',
    effect: resolver('e2', 'asignada', ['laura', 'tomas', 'valentina']),
  },
  {
    flow: 3,
    owner: MARTA,
    caption: 'Los $5.000 de Carlos quedan registrados como pago parcial.',
    why: 'No se pierden ni quedan «para ver después»: la cuota muestra cuánto falta.',
    web: { tab: 'revisar', role: 'tesorero' },
    focus: 'web',
    effect: resolverParcial('e3', 'carlos', 5000),
  },
  {
    flow: 3,
    owner: ROBERTO,
    caption: 'Roberto recibe la confirmación de su pago.',
    why: 'Sin hacer nada más que transferir.',
    web: { tab: 'cuotas', role: 'tesorero' },
    focus: 'chat',
    messages: [
      {
        id: 'f3-roberto',
        from: 'club',
        lines: [
          '¡Hola, Roberto! ✅ Confirmamos tu pago de **$23.000** por la cuota de noviembre de **Camila** (Vóley). Ya está al día.',
          '¡Gracias por acompañar al club!',
        ],
      },
    ],
  },
  {
    flow: 3,
    owner: CARLOS,
    caption: 'Carlos recibe lo que pagó y cuánto le falta, sin reproches.',
    why: 'La deuda queda clara para los dos lados, que es lo que hoy se pierde en la planilla.',
    web: { tab: 'cuotas', role: 'tesorero' },
    focus: 'chat',
    messages: [
      {
        id: 'f3-carlos',
        from: 'club',
        lines: [
          '¡Hola, Carlos! Recibimos tu pago de **$5.000** a cuenta de la cuota de noviembre. 🧡',
          'Te faltan **$18.000**. Podés completarlos hasta el 10/11, en una o varias transferencias al alias **' + CLUB.alias + '**: cada pago se descuenta solo.',
          'Si necesitás hablar con la tesorería, escribinos por acá.',
        ],
      },
    ],
  },

  /* ── Flujo 4 · ¿Alcanza el mes? ── */
  {
    flow: 4,
    owner: null,
    caption: 'La comisión directiva abre la web y ve si el mes alcanza.',
    why: 'Es lo primero que necesita saber, antes que cualquier detalle.',
    web: { tab: 'resumen', role: 'comision' },
    focus: 'web',
  },
  {
    flow: 4,
    owner: null,
    caption: 'La comisión carga el gasto fijo del mes.',
    why: 'Lo carga una vez y lo edita cuando algo cambia. El estado del mes se recalcula al instante.',
    hint: 'Probá «Editar» para cambiar un monto o agregar un gasto',
    web: { tab: 'resumen', role: 'comision' },
    focus: 'web',
  },
  {
    flow: 4,
    owner: null,
    caption: 'La comisión compara con los meses anteriores.',
    why: 'Desde agosto, cuando el club empezó con Tribuna, el cobro pasó del 64% al 76%. La tendencia dice más que un mes suelto.',
    web: { tab: 'historial', role: 'comision' },
    focus: 'web',
  },
  {
    flow: 4,
    owner: null,
    caption: 'La comisión ve totales, nunca quién debe.',
    why: 'El detalle de cada familia queda con el tesorero. Si cambia el tesorero, se autoriza desde acá y el historial queda en el club.',
    web: { tab: 'resumen', role: 'comision' },
    focus: 'web',
  },

  /* ── Flujo 5 · Cuando alguien se atrasa ── */
  {
    flow: 5,
    owner: DIEGO,
    caption: '11 de noviembre: la cuota de Bruno venció y el club le escribe a Diego.',
    why: 'Lo manda el club, no la tesorera: nadie tiene que reclamarle a un vecino.',
    hint: 'Tocá «Estoy complicado este mes»',
    waitFor: 'complicado',
    web: tes,
    focus: 'chat',
    messages: [
      {
        id: 'f5-recordatorio',
        from: 'club',
        lines: [
          '¡Hola, Diego! La cuota de noviembre de **Bruno** (Básquet) venció ayer: **$23.000**.',
          `Si se te pasó, podés pagarla al alias **${CLUB.alias}**.`,
          'Si estás pasando un momento difícil, hacénoslo saber respondiendo este mensaje y la tesorería se va a comunicar con vos, sin compromiso. 🧡',
        ],
        buttons: [
          { action: 'complicado', label: 'Estoy complicado este mes', primary: true },
          { action: 'pago-semana', label: 'La pago esta semana' },
        ],
      },
    ],
  },
  {
    flow: 5,
    owner: DIEGO,
    caption: 'Diego avisa con un toque y el club le pregunta cómo prefiere que lo contacten.',
    why: 'Su situación la ve solo la tesorería. La comisión sigue viendo totales, nunca nombres.',
    hint: 'Tocá «Que me llamen»',
    waitFor: 'llamada',
    web: tes,
    focus: 'chat',
    effect: pideHablar('bruno'),
    messages: [
      { id: 'f5-diego', from: 'user', lines: ['Estoy complicado este mes'] },
      {
        id: 'f5-gracias',
        from: 'club',
        lines: [
          'Gracias por avisarnos, Diego. 🧡',
          'Nos gustaría charlar con vos para ver juntos algunas opciones, así Bruno puede seguir viniendo al club. Esto queda entre vos y la tesorería.',
          '¿Cómo preferís que te contactemos?',
        ],
        buttons: [
          { action: 'llamada', label: 'Que me llamen', primary: true },
          { action: 'por-mensaje', label: 'Por mensaje' },
        ],
      },
    ],
  },
  {
    flow: 5,
    owner: DIEGO,
    caption: 'Diego prefiere una llamada y el club le avisa quién lo va a llamar.',
    why: 'Sabe qué esperar: nada de llamadas sorpresa.',
    web: tes,
    focus: 'chat',
    effect: prefiere('bruno', 'llamada'),
    messages: [
      { id: 'f5-llamen', from: 'user', lines: ['Que me llamen'] },
      { id: 'f5-ok', from: 'club', lines: ['Listo, Diego. Marta, la tesorera del club, te va a llamar en estos días.'] },
    ],
  },
  {
    flow: 5,
    owner: MARTA,
    caption: 'Marta ve el número de Diego, lo llama y registra lo que acordaron.',
    why: 'Se entera a tiempo, sin salir a reclamar, y el acuerdo queda en el club.',
    hint: 'Después de la llamada, tocá «Registrar acuerdo»',
    waitFor: 'acuerdo',
    web: tes,
    focus: 'web',
    messages: [
      {
        id: 'f5-marta',
        from: 'club',
        lines: [
          '¡Buen día, Marta! **Diego Acosta** (responsable de Bruno) está complicado este mes y prefiere que lo llames.',
          'Te dejamos su número en la web.',
        ],
      },
    ],
  },
  {
    flow: 5,
    owner: DIEGO,
    caption: 'Diego recibe por escrito lo acordado y la cuota queda «Con acuerdo».',
    why: 'Los recordatorios se adaptan: le llega uno el día anterior a lo acordado. Si no se cumple, el caso vuelve a Marta, no a un reclamo automático.',
    web: tes,
    focus: 'chat',
    effect: acordar('bruno'),
    messages: [
      {
        id: 'f5-acuerdo',
        from: 'club',
        lines: acuerdoPorDefecto.lineas, // se reemplaza por el acuerdo registrado
      },
    ],
  },
]

/** Estado que resulta de reproducir los pasos hasta `index` (incluido). */
export function stateAt(index: number): DemoState {
  let s = initialState()
  const llegan = STEPS.findIndex((st) => st.flow === 3)
  const vence = STEPS.findIndex((st) => st.flow === 5)
  for (let i = 0; i <= index; i++) {
    // Los pagos para revisar llegan la noche del 5/11: aparecen desde el recorrido 3.
    if (i === llegan)
      s = { ...s, excepciones: Object.fromEntries(Object.entries(s.excepciones).map(([k, v]) => [k, v === 'futuro' ? 'pendiente' : v])) }
    // El recorrido 5 pasa el 11/11: lo que no se pagó ya está vencido.
    if (i === vence)
      s = {
        ...s,
        vencido: true,
        cuotas: Object.fromEntries(Object.entries(s.cuotas).map(([k, c]) => [k, c.status === 'pendiente' ? { ...c, status: 'vencida' } : c])),
      }
    const fx = STEPS[i].effect
    s = fx ? fx(s) : { ...s, highlight: [] }
  }
  return s
}

/** Conversación visible en el celular para el paso `index`. */
export function threadAt(index: number): ChatMsg[] {
  const step = STEPS[index]
  if (!step.owner) return []
  const msgs: ChatMsg[] = []
  for (let i = 0; i <= index; i++) {
    const st = STEPS[i]
    if (st.flow === step.flow && st.owner?.id === step.owner.id && st.messages) msgs.push(...st.messages)
  }
  return msgs.map((m) => (m.id === 'f5-acuerdo' ? { ...m, lines: acuerdoActual.lineas } : m))
}

export const firstStepOf = (flow: number) => STEPS.findIndex((s) => s.flow === flow)
