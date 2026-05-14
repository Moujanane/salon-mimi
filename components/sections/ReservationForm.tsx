"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  services,
  packages,
  getServiceName,
  Service,
  Package,
} from "@/lib/services-data";

interface ReservationFormProps {
  locale: string;
  labels: {
    name: string;
    phone: string;
    service: string;
    date: string;
    message: string;
    submit: string;
    success: string;
    error: string;
  };
}

type ServiceOrPackage =
  | (Service & { nameFr: string; nameEn: string; nameEs: string })
  | (Package & { nameFr: string; nameEn: string; nameEs: string });

const allOptions: ServiceOrPackage[] = [
  ...(services.map((s) => ({
    id: s.id,
    nameFr: s.nameFr,
    nameEn: s.nameEn,
    nameEs: s.nameEs,
    category: s.category,
    durationFr: s.durationFr,
    durationEn: s.durationEn,
    durationEs: s.durationEs,
    priceMad: s.priceMad,
    priceEur: s.priceEur,
    featured: s.featured,
  })) as ServiceOrPackage[]),
  ...(packages.map((p) => ({
    id: p.id,
    nameFr: p.nameFr,
    nameEn: p.nameEn,
    nameEs: p.nameEs,
    descFr: p.descFr,
    descEn: p.descEn,
    descEs: p.descEs,
    durationFr: p.durationFr,
    durationEn: p.durationEn,
    durationEs: p.durationEs,
    priceMad: p.priceMad,
    priceEur: p.priceEur,
  })) as ServiceOrPackage[]),
];

function FormInner({ locale, labels }: ReservationFormProps) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    service: searchParams.get("service") ?? "",
    date_souhaitee: "",
    message: "",
  });

  useEffect(() => {
    const s = searchParams.get("service");
    if (s) setForm((f) => ({ ...f, service: s }));
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");

    const selected = allOptions.find((o) => o.id === form.service);
    const serviceName = selected
      ? getServiceName(selected, locale)
      : form.service;

    const lines = [
      "Bonjour Mimi, je souhaite réserver une prestation.",
      `Nom : ${form.nom}`,
      `Service : ${serviceName}`,
      form.date_souhaitee ? `Date souhaitée : ${form.date_souhaitee}` : null,
      form.message ? `Message : ${form.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const waLink = `https://wa.me/212710388204?text=${encodeURIComponent(
      lines,
    )}`;
    setTimeout(() => window.open(waLink, "_blank"), 1000);
  }

  const inputClass =
    "w-full border border-ocre/30 rounded-xl px-4 py-3 focus:outline-none focus:border-ocre bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-brun mb-2">
          {labels.name} *
        </label>
        <input
          type="text"
          required
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brun mb-2">
          {labels.phone} *
        </label>
        <input
          type="tel"
          required
          value={form.telephone}
          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brun mb-2">
          {labels.service} *
        </label>
        <select
          required
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
          className={inputClass}
        >
          <option value="">—</option>
          {allOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {getServiceName(o, locale)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-brun mb-2">
          {labels.date}
        </label>
        <input
          type="date"
          value={form.date_souhaitee}
          onChange={(e) => setForm({ ...form, date_souhaitee: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brun mb-2">
          {labels.message}
        </label>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${inputClass} resize-none`}
        />
      </div>
      {status === "success" && (
        <p className="text-green-600 font-medium text-center">
          {labels.success}
        </p>
      )}
      {status === "error" && (
        <p className="text-red-600 font-medium text-center">{labels.error}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-ocre text-white py-4 rounded-full font-medium text-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "..." : labels.submit}
      </button>
    </form>
  );
}

export default function ReservationForm(props: ReservationFormProps) {
  return (
    <Suspense>
      <FormInner {...props} />
    </Suspense>
  );
}
