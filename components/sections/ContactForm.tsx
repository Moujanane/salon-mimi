"use client";

import { useState } from "react";

const texts = {
  fr: {
    title: "Envoyer un message",
    prenom: "Prénom",
    nom: "Nom",
    telephone: "Téléphone",
    email: "Email",
    demande: "Votre demande",
    submit: "Envoyer",
    sending: "Envoi en cours…",
    success: "Message envoyé. Nous vous répondrons rapidement.",
    error: "Une erreur est survenue. Réessayez ou contactez-nous par WhatsApp.",
  },
  en: {
    title: "Send a message",
    prenom: "First name",
    nom: "Last name",
    telephone: "Phone",
    email: "Email",
    demande: "Your message",
    submit: "Send",
    sending: "Sending…",
    success: "Message sent. We will get back to you shortly.",
    error: "Something went wrong. Please try again or contact us via WhatsApp.",
  },
  es: {
    title: "Enviar un mensaje",
    prenom: "Nombre",
    nom: "Apellido",
    telephone: "Teléfono",
    email: "Email",
    demande: "Su mensaje",
    submit: "Enviar",
    sending: "Enviando…",
    success: "Mensaje enviado. Le responderemos pronto.",
    error: "Algo salió mal. Inténtelo de nuevo o contáctenos por WhatsApp.",
  },
};

const inputClass =
  "w-full bg-fond border border-ocre/30 rounded-xl px-4 py-3 text-sm text-brun placeholder:text-brun/40 focus:outline-none focus:border-ocre transition-colors";

export default function ContactForm({ locale }: { locale: string }) {
  const t = texts[locale as keyof typeof texts] ?? texts.fr;
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = {
      prenom: (form.elements.namedItem("prenom") as HTMLInputElement).value,
      nom: (form.elements.namedItem("nom") as HTMLInputElement).value,
      telephone: (form.elements.namedItem("telephone") as HTMLInputElement)
        .value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      demande: (form.elements.namedItem("demande") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-ocre/20 rounded-2xl p-8 text-center shadow-sm">
        <p className="text-ocre font-playfair text-xl mb-2">✓</p>
        <p className="text-brun/70 text-sm">{t.success}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-ocre/20 rounded-2xl p-8 shadow-sm">
      <h2 className="font-playfair text-2xl text-brun mb-6">{t.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="prenom"
            type="text"
            required
            placeholder={t.prenom}
            className={inputClass}
          />
          <input
            name="nom"
            type="text"
            required
            placeholder={t.nom}
            className={inputClass}
          />
        </div>
        <input
          name="telephone"
          type="tel"
          required
          placeholder={t.telephone}
          className={inputClass}
        />
        <input
          name="email"
          type="email"
          required
          placeholder={t.email}
          className={inputClass}
        />
        <textarea
          name="demande"
          required
          rows={4}
          placeholder={t.demande}
          className={`${inputClass} resize-none`}
        />
        {status === "error" && (
          <p className="text-red-400 text-xs">{t.error}</p>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-ocre hover:bg-or text-white text-sm tracking-widest uppercase py-3 rounded-full transition-colors disabled:opacity-50"
        >
          {status === "sending" ? t.sending : t.submit}
        </button>
      </form>
    </div>
  );
}
