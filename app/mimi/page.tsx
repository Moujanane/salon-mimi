"use client";
import { useState, useEffect, useCallback } from "react";

interface Reservation {
  id: string;
  nom: string;
  telephone: string;
  service: string;
  date_souhaitee: string | null;
  heure_souhaitee: string | null;
  statut: "en_attente" | "confirmee" | "annulee";
  created_at: string;
  message: string | null;
  nombre_personnes: number | null;
}

type Filtre = "aujourd_hui" | "semaine" | "tout";

const STATUT_COLORS: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-800",
  confirmee: "bg-green-100 text-green-800",
  annulee: "bg-red-100 text-red-800",
};

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
};

function formatDate(d: string | null) {
  if (!d) return "Date non précisée";
  return new Date(d).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function isToday(d: string | null) {
  if (!d) return false;
  const today = new Date();
  const date = new Date(d);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isThisWeek(d: string | null) {
  if (!d) return false;
  const today = new Date();
  const date = new Date(d);
  const diffDays = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= -1 && diffDays <= 7;
}

export default function MimiPage() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filtre, setFiltre] = useState<Filtre>("aujourd_hui");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [pinError, setPinError] = useState("");

  const fetchReservations = useCallback(async (currentPin: string) => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/mimi?pin=${encodeURIComponent(currentPin)}`);
    if (!res.ok) {
      setError("Impossible de charger les réservations.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setReservations(data.reservations ?? []);
    setLoading(false);
  }, []);

  async function handlePinSubmit() {
    if (pin.length < 4) {
      setPinError("Entre ton code à 4 chiffres.");
      return;
    }
    setLoading(true);
    setPinError("");
    const res = await fetch(`/api/mimi?pin=${encodeURIComponent(pin)}`);
    if (!res.ok) {
      setPinError("Code incorrect. Réessaie.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setReservations(data.reservations ?? []);
    setAuthenticated(true);
    setLoading(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mimi_pin", pin);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("mimi_pin");
    if (!saved) return;
    setPin(saved);
    fetch(`/api/mimi?pin=${encodeURIComponent(saved)}`)
      .then((res) => {
        if (res.ok) {
          return res.json().then((data) => {
            setReservations(data.reservations ?? []);
            setAuthenticated(true);
          });
        } else {
          sessionStorage.removeItem("mimi_pin");
        }
      })
      .catch(() => {
        sessionStorage.removeItem("mimi_pin");
      });
  }, []);

  const filtered = reservations.filter((r) => {
    if (filtre === "aujourd_hui") return isToday(r.date_souhaitee);
    if (filtre === "semaine") return isThisWeek(r.date_souhaitee);
    return true;
  });

  const todayCount = reservations.filter((r) =>
    isToday(r.date_souhaitee),
  ).length;
  const semaineCount = reservations.filter((r) =>
    isThisWeek(r.date_souhaitee),
  ).length;

  async function updateStatut(id: string, statut: string) {
    setUpdating(id);
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    if (res.ok) {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, statut: statut as Reservation["statut"] } : r,
        ),
      );
    }
    setUpdating(null);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#1a0a00] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">✂️</div>
            <h1 className="text-white text-2xl font-bold mb-1">
              Mimi Coiffure
            </h1>
            <p className="text-[#c9a96e] text-sm">Planning des réservations</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
            <label className="block text-white text-sm mb-3 font-medium">
              Entre ton code
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setPinError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              placeholder="• • • •"
              className="w-full bg-white/20 text-white placeholder-white/40 text-center text-3xl tracking-[1rem] rounded-xl px-4 py-4 outline-none border-2 border-transparent focus:border-[#c9a96e]"
            />
            {pinError && (
              <p className="text-red-400 text-sm mt-2 text-center">
                {pinError}
              </p>
            )}
            <button
              onClick={handlePinSubmit}
              disabled={loading}
              className="w-full mt-4 bg-[#c9a96e] text-white font-semibold py-4 rounded-xl text-lg disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? "Chargement…" : "Voir mes réservations"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <div className="bg-[#1a0a00] px-4 pt-8 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-bold text-xl">✂️ Mimi Coiffure</h1>
            <p className="text-[#c9a96e] text-xs">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <button
            onClick={() => fetchReservations(pin)}
            className="bg-white/10 text-white text-sm px-3 py-2 rounded-xl active:scale-95 transition-transform"
          >
            🔄 Actualiser
          </button>
        </div>

        {/* Filtres */}
        <div className="flex gap-2">
          {(
            [
              { key: "aujourd_hui", label: `Aujourd'hui (${todayCount})` },
              { key: "semaine", label: `Cette semaine (${semaineCount})` },
              { key: "tout", label: `Tout (${reservations.length})` },
            ] as { key: Filtre; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltre(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filtre === key
                  ? "bg-[#c9a96e] text-white"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="px-4 py-4 space-y-3">
        {loading && (
          <div className="text-center py-16 text-gray-400">Chargement…</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm text-center">
            {error}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🗓️</div>
            <p className="text-gray-500 text-sm">
              {filtre === "aujourd_hui"
                ? "Aucune réservation aujourd'hui"
                : filtre === "semaine"
                  ? "Aucune réservation cette semaine"
                  : "Aucune réservation"}
            </p>
          </div>
        )}

        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Bandeau date */}
            <div className="bg-[#1a0a00]/5 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[#1a0a00]">
                {formatDate(r.date_souhaitee)}
                {r.heure_souhaitee && (
                  <span className="ml-2 text-[#c9a96e]">
                    à {r.heure_souhaitee}
                  </span>
                )}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_COLORS[r.statut]}`}
              >
                {STATUT_LABELS[r.statut]}
              </span>
            </div>

            {/* Infos cliente */}
            <div className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a0a00] text-base truncate">
                    {r.nom}
                  </p>
                  <p className="text-[#c9a96e] text-sm font-medium">
                    {r.service}
                  </p>
                  {r.nombre_personnes && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      {r.nombre_personnes} personne
                      {r.nombre_personnes > 1 ? "s" : ""}
                    </p>
                  )}
                  {r.message && (
                    <p className="text-gray-500 text-xs mt-1 italic">
                      &ldquo;{r.message}&rdquo;
                    </p>
                  )}
                </div>

                {/* Bouton WhatsApp */}
                <a
                  href={`https://wa.me/${r.telephone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 bg-[#25D366] text-white text-xs font-semibold px-3 py-2 rounded-xl active:scale-95 transition-transform"
                >
                  📞 WA
                </a>
              </div>

              <p className="text-gray-400 text-xs mt-2">{r.telephone}</p>

              {/* Changer statut */}
              <div className="flex gap-2 mt-3">
                {(["en_attente", "confirmee", "annulee"] as const).map((s) => (
                  <button
                    key={s}
                    disabled={r.statut === s || updating === r.id}
                    onClick={() => updateStatut(r.id, s)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                      r.statut === s
                        ? "border-transparent bg-gray-100 text-gray-400"
                        : "border-gray-200 text-gray-600 active:bg-gray-50"
                    }`}
                  >
                    {STATUT_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Padding bottom pour éviter que le dernier élément soit caché */}
      <div className="h-8" />
    </div>
  );
}
