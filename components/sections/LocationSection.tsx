export default function LocationSection({
  locale,
  whatsappNumber,
}: {
  locale: string;
  whatsappNumber: string;
}) {
  const content = {
    fr: {
      badge: "Où nous trouver",
      title: "Au cœur de la Médina",
      titleAccent: "Place Jamaa El Fna",
      text: "Salon Mimi est situé en plein centre historique de Marrakech, à deux pas de la célèbre place Jamaa El Fna. Que tu sois habitante de la Médina ou touriste de passage, nous sommes faciles d'accès depuis toute la ville.",
      address: "Médina de Marrakech, près de la Place Jamaa El Fna",
      hours: "Lun–Sam : 9h–20h · Dim : 10h–18h",
      cta: "Obtenir l'itinéraire",
      labelAddress: "Adresse",
      labelHours: "Horaires",
      labelWhatsapp: "WhatsApp",
    },
    en: {
      badge: "Find us",
      title: "In the heart of the Medina",
      titleAccent: "Jamaa El Fna Square",
      text: "Salon Mimi is located in the historic centre of Marrakech, steps away from the famous Jamaa El Fna square. Whether you live in the Medina or are visiting, we are easy to reach from anywhere in the city.",
      address: "Medina of Marrakech, near Jamaa El Fna Square",
      hours: "Mon–Sat: 9am–8pm · Sun: 10am–6pm",
      cta: "Get directions",
      labelAddress: "Address",
      labelHours: "Opening hours",
      labelWhatsapp: "WhatsApp",
    },
    es: {
      badge: "Encuéntranos",
      title: "En el corazón de la Medina",
      titleAccent: "Plaza Jamaa El Fna",
      text: "Salon Mimi está ubicado en el centro histórico de Marrakech, a pasos de la famosa plaza Jamaa El Fna. Tanto si vives en la Medina como si estás de visita, somos fácilmente accesibles desde toda la ciudad.",
      address: "Medina de Marrakech, cerca de la Plaza Jamaa El Fna",
      hours: "Lun–Sáb: 9h–20h · Dom: 10h–18h",
      cta: "Obtener indicaciones",
      labelAddress: "Dirección",
      labelHours: "Horario",
      labelWhatsapp: "WhatsApp",
    },
  };

  const c = content[locale as keyof typeof content] ?? content.fr;

  return (
    <section className="bg-nuit border-t border-ocre/15 py-20 px-6 md:px-16">
      <div className="flex items-center gap-3 mb-6 justify-center">
        <div className="w-8 h-px bg-ocre" />
        <span className="text-ocre text-[9px] tracking-[4px] uppercase font-inter">
          {c.badge}
        </span>
        <div className="w-8 h-px bg-ocre" />
      </div>

      <h2 className="font-georgia text-[clamp(26px,3.5vw,44px)] font-bold text-white text-center leading-tight mb-12">
        {c.title} · <em className="text-ocre italic">{c.titleAccent}</em>
      </h2>

      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        <div
          className="flex-1 rounded-2xl overflow-hidden border border-ocre/20"
          style={{ minHeight: "300px" }}
        >
          <iframe
            title="Salon Mimi — Place Jamaa El Fna, Marrakech"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3396.5!2d-7.9892!3d31.6258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDM3JzMyLjkiTiA3wrA1OSczMi4xIlc!5e0!3m2!1sfr!2sma!4v1"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "300px" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="lg:w-80 flex flex-col justify-center gap-6 bg-panneau rounded-2xl border border-ocre/20 p-8">
          <div>
            <div className="text-[9px] tracking-[3px] uppercase text-ocre font-inter mb-2">
              {c.labelAddress}
            </div>
            <p className="text-white text-[14px] leading-relaxed">
              {c.address}
            </p>
          </div>
          <div className="h-px bg-ocre/15" />
          <div>
            <div className="text-[9px] tracking-[3px] uppercase text-ocre font-inter mb-2">
              {c.labelHours}
            </div>
            <p className="text-white/70 text-[13px] leading-relaxed">
              {c.hours}
            </p>
          </div>
          <div className="h-px bg-ocre/15" />
          <div>
            <div className="text-[9px] tracking-[3px] uppercase text-ocre font-inter mb-2">
              {c.labelWhatsapp}
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              className="text-white hover:text-ocre text-[14px] transition-colors"
            >
              {whatsappNumber}
            </a>
          </div>
          <a
            href="https://maps.app.goo.gl/siZDajFcmc85HF519"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-ocre hover:bg-or text-white text-[10px] tracking-[2px] uppercase px-6 py-3 rounded-full transition-colors font-inter"
          >
            → {c.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
