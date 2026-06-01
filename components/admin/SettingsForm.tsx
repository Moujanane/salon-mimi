// components/admin/SettingsForm.tsx
"use client";
import { useState, useEffect } from "react";
import type { Settings } from "@/lib/settings";

const SERVICE_KEYS: (keyof Settings)[] = [
  "price_tresses_africaines",
  "price_tresses_et_nattes",
  "price_box_braids",
  "price_tresses_fulani",
  "price_tresses_boho",
  "price_locks_dreads",
  "price_cheveux_attaches",
  "price_perruques_tissage",
  "price_colorations",
  "price_ongles_soins_epilation",
];

const FEATURED_KEYS: (keyof Settings)[] = [
  "price_featured_box_braids_medium",
  "price_featured_knotless_braids",
  "price_featured_boho_braids",
  "price_featured_cornrows",
];

const SERVICE_LABELS: Record<string, string> = {
  price_tresses_africaines: "Tresses africaines",
  price_tresses_et_nattes: "Tresses et nattes",
  price_box_braids: "Box braids",
  price_tresses_fulani: "Tresses Fulani",
  price_tresses_boho: "Tresses Boho",
  price_locks_dreads: "Locks & dreads",
  price_cheveux_attaches: "Cheveux attachés",
  price_perruques_tissage: "Perruques et tissage",
  price_colorations: "Colorations capillaires",
  price_ongles_soins_epilation: "Ongles, soins & épilation",
  price_featured_box_braids_medium: "Box Braids medium",
  price_featured_knotless_braids: "Knotless Braids",
  price_featured_boho_braids: "Boho / Goddess Braids",
  price_featured_cornrows: "Cornrows full head",
};

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState<Settings>(initial);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Settings) => {
        setValues(data);
        setLoaded(true);
      })
      .catch((err) => {
        console.error("[SettingsForm] fetch failed:", err);
        setLoaded(true);
      });
  }, []);

  function handleChange(key: keyof Settings, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\+?[\d\s\-().]{6,20}$/.test(values.whatsapp_number)) {
      setMessage("Numéro WhatsApp invalide. Format attendu : +212600000000");
      return;
    }
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setMessage(
      res.ok ? "Paramètres sauvegardés." : "Erreur lors de la sauvegarde.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl">
      {!loaded && (
        <p className="text-sm text-gray-400 animate-pulse">
          Chargement des paramètres…
        </p>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="font-playfair text-xl text-brun">WhatsApp</h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 uppercase tracking-wide">
            Numéro WhatsApp
          </label>
          <input
            type="text"
            value={values.whatsapp_number}
            onChange={(e) => handleChange("whatsapp_number", e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white outline-none focus:border-brun focus-visible:ring-2 focus-visible:ring-ocre focus-visible:ring-offset-1 focus-visible:ring-offset-white"
            placeholder="+212600000000"
          />
          <p className="text-xs text-gray-400 mt-1">
            Format : +212600000000 — chiffres et + uniquement
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-playfair text-xl text-brun">Notifications</h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 uppercase tracking-wide">
            Email de notification des réservations
          </label>
          <input
            type="email"
            value={values.notification_email}
            onChange={(e) => handleChange("notification_email", e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white outline-none focus:border-brun focus-visible:ring-2 focus-visible:ring-ocre focus-visible:ring-offset-1 focus-visible:ring-offset-white"
            placeholder="mimi@exemple.com"
          />
          <p className="text-xs text-gray-400 mt-1">
            Un email est envoyé à cette adresse à chaque nouvelle réservation.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-playfair text-xl text-brun">
          Services vedettes — Prix (MAD)
        </h2>
        <p className="text-xs text-gray-400 -mt-1">
          Ces prix s&apos;affichent sur la page d&apos;accueil dans les cards «
          Services vedettes ».
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURED_KEYS.map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                {SERVICE_LABELS[key]}
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-brun">
                <input
                  type="number"
                  min="0"
                  value={values[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-900 bg-white outline-none focus-visible:ring-2 focus-visible:ring-ocre focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                />
                <span className="px-3 text-sm text-gray-400 bg-gray-50 border-l border-gray-200">
                  MAD
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-playfair text-xl text-brun">
          Prix des services (MAD)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICE_KEYS.map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                {SERVICE_LABELS[key]}
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-brun">
                <input
                  type="number"
                  min="0"
                  value={values[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-900 bg-white outline-none focus-visible:ring-2 focus-visible:ring-ocre focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                />
                <span className="px-3 text-sm text-gray-400 bg-gray-50 border-l border-gray-200">
                  MAD
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <p
          className={`text-sm ${message.includes("Erreur") ? "text-red-500" : "text-green-600"}`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !loaded}
        className="self-start bg-brun hover:bg-brun/90 text-white text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-50"
      >
        {saving ? "Sauvegarde…" : "Sauvegarder"}
      </button>
    </form>
  );
}
