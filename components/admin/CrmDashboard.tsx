// components/admin/CrmDashboard.tsx
"use client";
import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

interface Deal {
  id: string;
  lead_id: string;
  amount: number;
  stage: string;
  closed_at: string | null;
}

const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  converted: "Converti",
  lost: "Perdu",
};

const LEAD_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border border-blue-200",
  contacted: "bg-amber-100 text-amber-800 border border-amber-200",
  qualified: "bg-purple-100 text-purple-700 border border-purple-200",
  converted: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  lost: "bg-red-100 text-red-700 border border-red-200",
};

const DEAL_STAGES = [
  "new",
  "qualified",
  "proposal",
  "closed_won",
  "closed_lost",
] as const;

const DEAL_STAGE_LABELS: Record<string, string> = {
  new: "Nouveau",
  qualified: "Qualifié",
  proposal: "Proposition",
  closed_won: "Gagné",
  closed_lost: "Perdu",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function monthKey(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
  });
}

export default function CrmDashboard({
  leads,
  deals,
}: {
  leads: Lead[];
  deals: Deal[];
}) {
  const [filterStatus, setFilterStatus] = useState("tous");

  const wonDeals = useMemo(
    () => deals.filter((d) => d.stage === "closed_won"),
    [deals],
  );
  const revenue = useMemo(
    () => wonDeals.reduce((sum, d) => sum + Number(d.amount), 0),
    [wonDeals],
  );

  const leadsPerMonth = useMemo(() => {
    const counts = new Map<string, number>();
    leads.forEach((l) => {
      const key = monthKey(l.created_at);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => ({ month: monthLabel(key), leads: count }));
  }, [leads]);

  const revenuePerStage = useMemo(() => {
    const sums = new Map<string, number>(DEAL_STAGES.map((s) => [s, 0]));
    deals.forEach((d) =>
      sums.set(d.stage, (sums.get(d.stage) ?? 0) + Number(d.amount)),
    );
    return DEAL_STAGES.map((stage) => ({
      stage: DEAL_STAGE_LABELS[stage],
      revenue: sums.get(stage) ?? 0,
    }));
  }, [deals]);

  const filteredLeads =
    filterStatus === "tous"
      ? leads
      : leads.filter((l) => l.status === filterStatus);

  const latestLeads = useMemo(
    () =>
      [...filteredLeads]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )
        .slice(0, 20),
    [filteredLeads],
  );

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Leads au total" value={leads.length.toString()} />
        <KpiCard label="Deals gagnés" value={wonDeals.length.toString()} />
        <KpiCard label="Revenu" value={formatCurrency(revenue)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-or/20 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-brun mb-4">
            Leads par mois
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={leadsPerMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                stroke="#999"
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#C17B3F"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-or/20 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-brun mb-4">
            Revenu par étape
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenuePerStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} stroke="#999" />
              <YAxis tick={{ fontSize: 12 }} stroke="#999" />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
              />
              <Bar dataKey="revenue" fill="#1A0D05" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leads table */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-brun">Derniers leads</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("tous")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filterStatus === "tous"
                  ? "bg-nuit text-white"
                  : "border border-gray-300 text-gray-600 hover:border-ocre hover:text-ocre"
              }`}
            >
              Tous ({leads.length})
            </button>
            {LEAD_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filterStatus === s
                    ? "bg-nuit text-white"
                    : "border border-gray-300 text-gray-600 hover:border-ocre hover:text-ocre"
                }`}
              >
                {LEAD_STATUS_LABELS[s]} (
                {leads.filter((l) => l.status === s).length})
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-or/20 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-nuit text-white">
                  <th className="text-left px-4 py-3 font-medium text-xs tracking-wide uppercase text-white/70">
                    Nom
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-xs tracking-wide uppercase text-white/70">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-xs tracking-wide uppercase text-white/70">
                    Statut
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-xs tracking-wide uppercase text-white/70">
                    Reçu le
                  </th>
                </tr>
              </thead>
              <tbody>
                {latestLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-12">
                      Aucun lead
                    </td>
                  </tr>
                )}
                {latestLeads.map((l) => (
                  <tr
                    key={l.id}
                    className="border-t border-gray-100 hover:bg-fond/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-brun">
                      {l.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{l.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          LEAD_STATUS_COLORS[l.status] ??
                          "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {LEAD_STATUS_LABELS[l.status] ?? l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(l.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-or/20 shadow-sm p-5">
      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-2">
        {label}
      </p>
      <p className="text-2xl font-playfair text-brun">{value}</p>
    </div>
  );
}
