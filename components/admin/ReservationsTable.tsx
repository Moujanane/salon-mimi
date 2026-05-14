// components/admin/ReservationsTable.tsx
"use client";
import { useState } from "react";
import StatusBadge from "./StatusBadge";

interface Reservation {
  id: string;
  nom: string;
  telephone: string;
  service: string;
  date_souhaitee: string | null;
  message: string | null;
  statut: "en_attente" | "confirmee" | "annulee";
  created_at: string;
}

const STATUTS = ["en_attente", "confirmee", "annulee"] as const;
const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
};

export default function ReservationsTable({
  reservations: initial,
}: {
  reservations: Reservation[];
}) {
  const [reservations, setReservations] = useState(initial);
  const [filterStatut, setFilterStatut] = useState("tous");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered =
    filterStatut === "tous"
      ? reservations
      : reservations.filter((r) => r.statut === filterStatut);

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

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR");
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-sm text-gray-600 font-medium">Filtrer :</span>
        <button
          onClick={() => setFilterStatut("tous")}
          className={`px-4 py-1.5 rounded-full text-sm ${filterStatut === "tous" ? "bg-nuit text-white" : "border border-gray-300 text-gray-600 hover:border-ocre"}`}
        >
          Tous ({reservations.length})
        </button>
        {STATUTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatut(s)}
            className={`px-4 py-1.5 rounded-full text-sm ${filterStatut === s ? "bg-nuit text-white" : "border border-gray-300 text-gray-600 hover:border-ocre"}`}
          >
            {STATUT_LABELS[s]} (
            {reservations.filter((r) => r.statut === s).length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-or/20 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-nuit text-white">
              <th className="text-left px-4 py-3 font-medium">
                Date souhaitée
              </th>
              <th className="text-left px-4 py-3 font-medium">Reçue le</th>
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium">Service</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-10">
                  Aucune réservation
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-t border-gray-100 hover:bg-fond/50 transition-colors"
              >
                <td className="px-4 py-3">{formatDate(r.date_souhaitee)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(r.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-brun">{r.nom}</div>
                  <div className="text-gray-500 text-xs">{r.telephone}</div>
                </td>
                <td className="px-4 py-3 text-brun">{r.service}</td>
                <td className="px-4 py-3">
                  <StatusBadge statut={r.statut} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      disabled={updating === r.id}
                      value={r.statut}
                      onChange={(e) => updateStatut(r.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-ocre disabled:opacity-50"
                    >
                      {STATUTS.map((s) => (
                        <option key={s} value={s}>
                          {STATUT_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <a
                      href={`https://wa.me/${r.telephone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] text-white text-xs px-3 py-1 rounded-lg hover:bg-[#128C7E] transition-colors"
                    >
                      WA
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
