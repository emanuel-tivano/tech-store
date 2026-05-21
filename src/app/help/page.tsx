const faqs = [
  {
    question: '¿Cuáles son las opciones de envío disponibles?',
    answer:
      'Ofrecemos envío estándar y express. Los costos y tiempos se confirman durante el checkout.',
  },
  {
    question: '¿Cómo puedo seguir mi pedido?',
    answer:
      'Una vez enviada la orden vas a recibir una confirmación con el identificador de compra.',
  },
  {
    question: '¿Cuál es la política de devolución?',
    answer:
      'Aceptamos devoluciones dentro de los 30 días para productos en condiciones originales.',
  },
];

export default function HelpPage() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="mb-2 text-3xl font-semibold">Preguntas frecuentes</h1>
        <p className="text-slate-600">
          Información general sobre compras, envíos y devoluciones.
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
