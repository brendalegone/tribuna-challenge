# Tribuna · Prototipo

Prototipo para el Design Challenge de Conexa: cobro y control de cuotas para clubes de barrio.

La demo muestra el concepto en **pantalla dividida**. A la izquierda, el WhatsApp del club: lo que viven los socios, los responsables de pago y la tesorera desde su celular. A la derecha, la web de Tribuna: lo que ven el tesorero y la comisión directiva desde la compu. La web se actualiza sola con cada acción del chat.

## Recorridos

1. **Aviso y pago.** Ana recibe el aviso una semana antes del vencimiento, transfiere desde su billetera y el pago se confirma solo. Si después manda el comprobante, el club le responde que ya estaba confirmado.
2. **Pago en efectivo.** Juan le paga en mano a la tesorera, que lo registra con un mensaje. Se equivoca de monto, lo corrige antes de confirmar y Juan recibe su comprobante.
3. **Pagos para revisar.** Lo que el sistema no pudo asignar llega en un solo resumen diario. La tesorera confirma sugerencias, un pago que cubre varias cuotas y un pago parcial.
4. **¿Alcanza el mes?** La comisión ve lo recaudado frente al gasto fijo (que edita ella), la comparación con el mes anterior y el historial desde que el club usa Tribuna.
5. **Cuando alguien se atrasa.** El club recuerda la cuota vencida sin que la tesorera tenga que reclamar. Diego avisa que está complicado, elige que lo llamen y el acuerdo queda registrado y por escrito.

Datos de ejemplo: Club Villa Pueyrredón, 300 cuotas de $23.000, gasto fijo estimado de $5.400.000.

## Cómo correrlo

Requiere Node 20 o superior.

```bash
npm install
npm run dev
```

`npm run build:single` genera un único `dist-single/index.html` autocontenido, que se abre con doble clic.

## Publicar en GitHub Pages

1. Creá un repositorio **público** y subí este proyecto a la rama `main`.
2. En el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. El workflow `.github/workflows/deploy.yml` compila y publica en cada push. El link queda en la pestaña **Actions** y en Settings → Pages.
4. Probá el link desde una ventana de incógnito para confirmar que abre sin pedir permisos.

## Stack y sistema de diseño

- React + TypeScript + Vite + Tailwind CSS v4.
- Componentes oficiales de [Fluid Functionalism](https://www.fluidfunctionalism.com) (MIT): Base UI, esquinas redondeadas, tamaño por defecto, íconos Tabler, tema claro con acento índigo (`#4F39F6`). Están en `src/components/ui`, con sus tokens en `src/styles`.
- `motion` para las animaciones con resortes.
- Inter con eje de tamaño óptico.
- Modo claro (predeterminado) y oscuro, solo en la web de Tribuna.

Para sumar o actualizar componentes de Fluid:

```bash
npx shadcn@latest add @fluid/<componente>
```

## Estructura

```
src/
  demo/          datos de ejemplo y guion de los 5 recorridos (pasos, mensajes y efectos)
  components/
    ui/          componentes oficiales de Fluid Functionalism
    shared/      piezas propias sobre Fluid (tabs por valor, estados de cuota)
    chat/        celular con la conversación de WhatsApp
    web/         web de Tribuna: Cuotas, Pagos para revisar, Resumen del mes, Historial
  styles/        tokens y estilos de Fluid
  App.tsx        guion de la demo, pantalla dividida, inicio y cierres de cada recorrido
```

Para cambiar textos del chat o el orden de los pasos, editá `src/demo/script.ts`.
