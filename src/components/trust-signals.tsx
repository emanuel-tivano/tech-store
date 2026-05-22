interface TrustSignal {
  title: string;
  description: string;
}

interface TrustSignalsProps {
  items?: TrustSignal[];
  title?: string;
}

const defaultTrustSignals: TrustSignal[] = [
  {
    title: 'Compra segura',
    description: 'Flujo de compra simple para revisar productos, cantidades y orden antes de confirmar.',
  },
  {
    title: 'Envíos seleccionados',
    description: 'Algunos productos cuentan con envío gratis y el resto muestra condiciones de entrega al avanzar.',
  },
  {
    title: 'Soporte y seguimiento',
    description: 'Podés revisar ayuda, contacto y estado general del pedido desde el flujo actual de la tienda.',
  },
  {
    title: 'Cambios y devoluciones',
    description: 'La experiencia está pensada para comunicar políticas claras sin promesas exageradas.',
  },
];

export function TrustSignals({
  items = defaultTrustSignals,
  title = 'Señales de confianza',
}: TrustSignalsProps) {
  return (
    <section className="surface-card rounded-3xl mt-7 border-slate-200/80">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div>
          <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
            Confianza
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
            >
              <p className="font-semibold text-slate-950">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
