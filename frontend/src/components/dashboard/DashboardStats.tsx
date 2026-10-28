import { ClipboardList, CheckCheck, Wrench } from "lucide-react";
import type { Orden } from "../../types";

interface DashboardStatsProps {
  ordenes: Orden[];
}

export const DashboardStats = ({ ordenes }: DashboardStatsProps) => {
  const enReparacion = ordenes.filter(
    (orden) => orden.estado_actual === "en_reparacion",
  ).length;
  const finalizadas = ordenes.filter(
    (orden) => orden.estado_actual === "finalizado",
  ).length;

  const stats = [
    {
      title: "Órdenes totales",
      value: ordenes.length,
      icon: ClipboardList,
      color: "text-blue-600",
      iconBg: "bg-blue-50",
      border: "border-t-blue-500",
    },
    {
      title: "En reparación",
      value: enReparacion,
      icon: Wrench,
      color: "text-orange-600",
      iconBg: "bg-orange-50",
      border: "border-t-orange-500",
    },
    {
      title: "Finalizadas",
      value: finalizadas,
      icon: CheckCheck,
      color: "text-green-600",
      iconBg: "bg-green-50",
      border: "border-t-green-500",
    },
  ];

  return (
    <section
      aria-label="Resumen de órdenes"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      {stats.map(({ title, value, icon: Icon, color, iconBg, border }) => (
        <article
          key={title}
          className={`rounded-2xl border border-gray-200 border-t-4 ${border} bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                {value}
              </p>
            </div>
            <span className={`grid size-11 place-items-center rounded-xl ${iconBg} ${color}`}>
              <Icon size={21} aria-hidden="true" />
            </span>
          </div>
        </article>
      ))}
    </section>
  );
};
