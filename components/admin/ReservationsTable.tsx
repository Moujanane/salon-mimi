// components/admin/ReservationsTable.tsx
"use client";
import { useState } from "react";

interface Reservation {
  id: string;
  nom: string;
  telephone: string;
  email: string | null;
  service: string;
  date_souhaitee: string | null;
  heure_souhaitee: string | null;
  nombre_personnes: string | null;
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
const STATUT_COLORS: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-800 border border-amber-200",
  confirmee: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  annulee: "bg-red-100 text-red-700 border border-red-200",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReservationsTable({
  reservations: initial,
}: {
  reservations: Reservation[];
}) {
  const [reservations, setReservations] = useState(initial);
  const [filterStatut, setFilterStatut] = useState("tous");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    filterStatut === "tous"
      ? reservations
      : reservations.filter((r) => r.statut === filterStatut);

  // Sélection
  const allSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((r) => next.add(r.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Mise à jour statut
  async function updateStatut(id: string, statut: string) {
    setUpdating(id);
    setUpdateError(null);
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
    } else {
      setUpdateError("Erreur lors de la mise à jour du statut.");
    }
    setUpdating(null);
  }

  // Suppression
  async function deleteSelected() {
    if (selected.size === 0) return;
    const confirmMsg =
      selected.size === 1
        ? "Supprimer cette réservation ?"
        : `Supprimer ${selected.size} réservations ?`;
    if (!confirm(confirmMsg)) return;

    setDeleting(true);
    setUpdateError(null);
    const ids = Array.from(selected);
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/reservations/${id}`, { method: "DELETE" })),
      );
      setReservations((prev) => prev.filter((r) => !ids.includes(r.id)));
      setSelected(new Set());
    } catch {
      setUpdateError("Erreur lors de la suppression.");
    }
    setDeleting(false);
  }

  return (
    <div>
      {/* Filtres + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Filtrer :</span>
          <button
            onClick={() => setFilterStatut("tous")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filterStatut === "tous"
                ? "bg-nuit text-white"
                : "border border-gray-300 text-gray-600 hover:border-ocre hover:text-ocre"
            }`}
          >
            Tous ({reservations.length})
          </button>
          {STATUTS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filterStatut === s
                  ? "bg-nuit text-white"
                  : "border border-gray-300 text-gray-600 hover:border-ocre hover:text-ocre"
              }`}
            >
              {STATUT_LABELS[s]} (
              {reservations.filter((r) => r.statut === s).length})
            </button>
          ))}
        </div>

        {selected.size > 0 && (
          <button
            onClick={deleteSelected}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {deleting ? "Suppression…" : `Supprimer (${selected.size})`}
          </button>
        )}
      </div>

      {updateError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {updateError}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-or/20 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-nuit text-white">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Sélectionner tout"
                    className="w-4 h-4 rounded accent-ocre cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs tracking-wide uppercase text-white/70">
                  Date RDV
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs tracking-wide uppercase text-white/70">
                  Reçue le
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs tracking-wide uppercase text-white/70">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs tracking-wide uppercase text-white/70">
                  Service
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs tracking-wide uppercase text-white/70">
                  Statut
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs tracking-wide uppercase text-white/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-12">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-gray-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">Aucune réservation</span>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <>
                  <tr
                    key={r.id}
                    className={`border-t border-gray-100 transition-colors ${
                      selected.has(r.id) ? "bg-ocre/5" : "hover:bg-fond/40"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggleOne(r.id)}
                        aria-label={`Sélectionner ${r.nom}`}
                        className="w-4 h-4 rounded accent-ocre cursor-pointer"
                      />
                    </td>

                    {/* Date RDV + heure */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-brun text-xs">
                        {formatDate(r.date_souhaitee)}
                      </div>
                      {r.heure_souhaitee && (
                        <div className="text-gray-400 text-xs mt-0.5">
                          {r.heure_souhaitee}
                        </div>
                      )}
                    </td>

                    {/* Reçue le */}
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDate(r.created_at)}
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-brun">{r.nom}</div>
                      <div className="text-gray-400 text-xs">{r.telephone}</div>
                      {r.email && (
                        <div className="text-gray-400 text-xs truncate max-w-[140px]">
                          {r.email}
                        </div>
                      )}
                      {r.nombre_personnes && (
                        <div className="text-gray-400 text-xs">
                          {r.nombre_personnes}
                        </div>
                      )}
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3 text-brun font-medium text-xs">
                      {r.service}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUT_COLORS[r.statut]}`}
                      >
                        {STATUT_LABELS[r.statut]}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Bouton détails */}
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === r.id ? null : r.id)
                          }
                          aria-label="Voir les détails"
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            expandedId === r.id
                              ? "bg-nuit text-white border-nuit"
                              : "border-gray-200 text-gray-500 hover:border-ocre hover:text-ocre"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Changement de statut */}
                        <select
                          aria-label="Changer le statut"
                          disabled={updating === r.id}
                          value={r.statut}
                          onChange={(e) => updateStatut(r.id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-brun focus:outline-none focus:border-ocre focus-visible:ring-2 focus-visible:ring-ocre disabled:opacity-50 cursor-pointer"
                        >
                          {STATUTS.map((s) => (
                            <option key={s} value={s}>
                              {STATUT_LABELS[s]}
                            </option>
                          ))}
                        </select>

                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/${r.telephone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Contacter sur WhatsApp"
                          className="bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                          WA
                        </a>
                      </div>
                    </td>
                  </tr>

                  {/* Ligne détails dépliable */}
                  {expandedId === r.id && (
                    <tr
                      key={`${r.id}-details`}
                      className="bg-fond/60 border-t border-ocre/10"
                    >
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">
                              Date souhaitée
                            </p>
                            <p className="text-brun font-semibold">
                              {formatDate(r.date_souhaitee)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">
                              Heure
                            </p>
                            <p className="text-brun font-semibold">
                              {r.heure_souhaitee ?? "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">
                              Personnes
                            </p>
                            <p className="text-brun font-semibold">
                              {r.nombre_personnes ?? "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">
                              Reçue le
                            </p>
                            <p className="text-brun font-semibold">
                              {formatDateTime(r.created_at)}
                            </p>
                          </div>
                          {r.email && (
                            <div className="col-span-2">
                              <p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">
                                Email
                              </p>
                              <p className="text-brun font-semibold">
                                {r.email}
                              </p>
                            </div>
                          )}
                          {r.message && (
                            <div className="col-span-2 md:col-span-4">
                              <p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">
                                Message
                              </p>
                              <p className="text-brun bg-white rounded-lg px-3 py-2 border border-ocre/10">
                                {r.message}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
