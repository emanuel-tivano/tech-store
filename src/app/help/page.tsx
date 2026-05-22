import type { Metadata } from 'next';

import { buildStorefrontMetadata } from '@/lib/metadata';

const faqs = [
  {
    question: '¿Cuáles son las opciones de envío disponibles?',
    answer:
      'La demo incluye envío a domicilio, retiro en punto de entrega y retiro acordado. El costo se calcula en el checkout simulado.',
  },
  {
    question: '¿Qué pasa después de confirmar el pedido?',
    answer:
      'La orden queda registrada en esta demo de portfolio y se muestra una confirmación en pantalla. No hay seguimiento logístico ni emails reales.',
  },
  {
    question: '¿El pago es real?',
    answer:
      'No. El checkout representa un flujo más creíble para portfolio, pero no procesa cobros ni integra una pasarela real.',
  },
];

export const metadata: Metadata = buildStorefrontMetadata({
  title: 'Ayuda y preguntas frecuentes',
  description: 'Preguntas frecuentes sobre el funcionamiento de esta demo ecommerce de portfolio, envíos simulados y proceso de compra.',
  pathname: '/help',
});

export default function HelpPage() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="mb-2 text-3xl font-semibold">Preguntas frecuentes</h1>
        <p className="text-slate-600">
          Información general sobre el flujo de compra, envío y validaciones de esta demo.
        </p>
      </div>

      <div className="flex flex-col gap-3" id="help-accordion">
        {faqs.map((faq, index) => (
          <details key={faq.question} className="faq-item" open={index === 0}>
            <summary className="faq-summary">{faq.question}</summary>
            <div className="faq-body">{faq.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
