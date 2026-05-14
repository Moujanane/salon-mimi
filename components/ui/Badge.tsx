interface BadgeProps {
  children: React.ReactNode;
  variant?: "vert" | "ocre" | "or";
}

export default function Badge({ children, variant = "vert" }: BadgeProps) {
  const styles = {
    vert: "bg-vert/10 text-vert border border-vert/20",
    ocre: "bg-ocre/10 text-ocre border border-ocre/20",
    or: "bg-or/10 text-brun border border-or/30",
  };

  return (
    <span
      className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
