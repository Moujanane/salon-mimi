// components/admin/SettingsForm.tsx
"use client";
import { useState } from "react";
import type { Settings } from "@/lib/settings";

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
};

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
    if (res.ok) {
      setMessage("Paramètres sauvegardés.");
    } else {
      setMessage("Erreur lors de la sauvegarde.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl">
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
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brun"
            placeholder="+212600000000"
          />
          <p className="text-xs text-gray-400 mt-1">
            Format : +212600000000 — chiffres et + uniquement
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-playfair text-xl text-brun">
          Prix des services (MAD)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(SERVICE_LABELS).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                {label}
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-brun">
                <input
                  type="number"
                  min="0"
                  value={values[key as keyof Settings]}
                  onChange={(e) =>
                    handleChange(key as keyof Settings, e.target.value)
                  }
                  className="flex-1 px-4 py-2.5 text-sm outline-none"
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
        disabled={saving}
        className="self-start bg-brun hover:bg-brun/90 text-white text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-50"
      >
        {saving ? "Sauvegarde…" : "Sauvegarder"}
      </button>
    </form>
  );
}
