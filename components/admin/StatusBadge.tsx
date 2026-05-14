// components/admin/StatusBadge.tsx
interface StatusBadgeProps {
  statut: "en_attente" | "confirmee" | "annulee";
}

const config = {
  en_attente: {
    label: "En attente",
    className: "bg-orange-100 text-orange-700 border border-orange-200",
  },
  confirmee: {
    label: "Confirmée",
    className: "bg-green-100 text-green-700 border border-green-200",
  },
  annulee: {
    label: "Annulée",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
};

export default function StatusBadge({ statut }: StatusBadgeProps) {
  const { label, className } = config[statut];
  return (
    <span
      className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${className}`}
    >
      {label}
    </span>
  );
}
