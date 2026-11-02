import { ClipboardList, CheckCheck, Wrench } from "lucide-react";
import type { Orden } from "../../types";

interface DashboardStatsProps {
  ordenes: Orden[];
  isLoading?: boolean;
}

export const DashboardStats = ({ ordenes, isLoading }: DashboardStatsProps) => {
  const enReparacion = ordenes.filter(
    (orden) => orden.estado_actual === "en_reparacion",
  ).length;
  const finalizadas = ordenes.filter(
    (orden) => orden.estado_actual === "finalizado",
  ).length;

  const stats = [
    {
      title: "Órdenes Totales",
      value: ordenes.length,
      icon: ClipboardList,
      color: "text-primary",
      iconBg: "bg-white/5",
      border: "border-l-4 border-brand-primary",
    },
    {
      title: "En Reparación Activa",
      value: enReparacion,
      icon: Wrench,
      color: "text-amber-400",
      iconBg: "bg-white/5",
      border: "border-l-4 border-amber-500",
    },
    {
      title: "Reparaciones Finalizadas",
      value: finalizadas,
      icon: CheckCheck,
      color: "text-emerald-400",
      iconBg: "bg-white/5",
      border: "border-l-4 border-emerald-500",
    },
  ];

  if (isLoading) {
    return (
      <section aria-label="Cargando resumen" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-lg glass-card p-5 animate-pulse">
            <div className="h-4 w-28 bg-white/10 rounded mb-3" />
            <div className="h-8 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      aria-label="Resumen de órdenes"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      {stats.map(({ title, value, icon: Icon, color, iconBg, border }) => (
        <article
          key={title}
          className={`rounded-lg glass-card ${border} p-5 transition-shadow hover:shadow-lg sm:p-6`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-muted uppercase">{title}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-app font-mono">
                {value}
              </p>
            </div>
            <span className={`grid size-12 shrink-0 place-items-center rounded-lg ${iconBg} ${color}`}>
              <Icon size={22} aria-hidden="true" />
            </span>
          </div>
        </article>
      ))}
    </section>
  );
};
