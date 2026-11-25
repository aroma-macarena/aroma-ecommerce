import { Container } from "@/components/public/container";

const steps = [
  {
    title: "Elige un producto",
    text: "Cada producto muestra la asociación que lo produce, sus presentaciones y precios de referencia.",
  },
  {
    title: "Escribe por WhatsApp",
    text: "El botón abre una conversación con la asociación y un mensaje sobre el producto ya escrito.",
  },
  {
    title: "Acuerda con quien produce",
    text: "Cantidades, precio final y cómo recibirlo se acuerdan con la asociación. AROMA no procesa pagos ni pedidos.",
  },
] as const;

/** The buying path, told once: the sequence is the information here. */
function HowToBuy() {
  return (
    <section aria-labelledby="como-comprar" className="bg-card border-y">
      <Container className="py-12 md:py-16">
        <h2
          id="como-comprar"
          className="font-sign text-[2.5rem] leading-[0.95] uppercase md:text-[3.5rem]"
        >
          Así se compra
        </h2>
        <ol className="border-foreground mt-8 grid border-t-[3px] md:grid-cols-3">
          {steps.map(({ title, text }, index) => (
            <li
              key={title}
              className="flex gap-4 border-b py-5 md:flex-col md:gap-3 md:border-b-0 md:border-l md:px-6 md:py-6 md:first:border-l-0 md:first:pl-0"
            >
              <span
                aria-hidden
                className="font-sign text-[3.5rem] leading-[0.8] md:text-[4.5rem]"
              >
                {index + 1}
              </span>
              <div className="space-y-1.5">
                <h3 className="font-editorial text-xl leading-snug font-semibold">
                  {title}
                </h3>
                <p className="text-muted-foreground max-w-[34ch] leading-relaxed">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export { HowToBuy };
