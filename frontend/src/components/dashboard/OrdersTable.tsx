import { Link } from "react-router-dom";
import { ArrowUpRight, ClipboardX } from "lucide-react";
import type { Orden } from "../../types";
import { formatLocalDate } from "../../utils/formatDate";

interface OrdersTableProps {
  ordenes: Orden[];
  isLoading: boolean;
}

const estadoClasses: Record<string, string> = {
  recibido: "border border-white/10 bg-white/5 text-muted",
  en_diagnostico: "border border-blue-500/30 bg-blue-500/10 text-blue-300",
  esperando_aprobacion: "border border-amber-500/30 bg-amber-500/10 text-amber-300",
  en_reparacion: "border border-orange-500/30 bg-orange-500/10 text-orange-300",
  en_pruebas: "border border-purple-500/30 bg-purple-500/10 text-purple-300",
  finalizado: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  entregado: "border border-teal-500/30 bg-teal-500/10 text-teal-300",
};

const EstadoBadge = ({ estado }: { estado: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${estadoClasses[estado] ?? "border border-white/10 bg-white/5 text-muted"}`}
  >
    <span className="mr-1.5 size-1.5 rounded-full bg-current" aria-hidden="true" />
    {estado.replaceAll("_", " ")}
  </span>
);

const tableHead =
  "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted uppercase border-b border-white/10 bg-transparent";
const tableCell = "px-4 py-3 align-middle text-sm text-app";

export const OrdersTable = ({ ordenes, isLoading }: OrdersTableProps) => (
  <div className="overflow-hidden rounded-lg glass-card">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/10">
        <thead>
          <tr>
            {["Nº Orden", "Estado", "Descripción de Falla", "Fecha de Recepción", "Acciones"].map(
              (heading) => (
                <th key={heading} scope="col" className={tableHead}>
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-transparent">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="bg-transparent">
                <td className={tableCell}>
                  <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                </td>
                <td className={tableCell}>
                  <div className="h-5 w-24 bg-white/10 rounded-full animate-pulse" />
                </td>
                <td className={tableCell}>
                  <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                </td>
                <td className={tableCell}>
                  <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
                </td>
                <td className={tableCell}>
                  <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                </td>
              </tr>
            ))
          ) : ordenes.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-16 text-center">
                <div className="mx-auto flex flex-col items-center justify-center">
                  <ClipboardX size={48} className="text-muted mb-3" aria-hidden="true" />
                  <p className="text-base font-semibold text-app">No se encontraron órdenes</p>
                  <p className="mt-1 text-xs text-muted">
                    Intenta ajustando los filtros de búsqueda o registra una nueva orden.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            ordenes.map((orden) => (
              <tr
                key={orden.id}
                className="transition-colors hover:bg-white/5"
              >
                <td className={`${tableCell} whitespace-nowrap font-bold text-app font-mono`}>
                  {orden.numero_orden}
                </td>
                <td className={tableCell}>
                  <EstadoBadge estado={orden.estado_actual} />
                </td>
                <td className={`${tableCell} min-w-56 text-app/90`}>
                  {orden.descripcion_falla}
                </td>
                <td className={`${tableCell} whitespace-nowrap text-muted text-xs font-medium`}>
                  {formatLocalDate(orden.fecha_recepcion)}
                </td>
                <td className={tableCell}>
                  <Link
                    to={`/ordenes/${orden.id}`}
                    className="inline-flex items-center gap-1 rounded border border-white/20 bg-transparent px-2.5 py-1.5 text-xs font-semibold text-app transition hover:bg-white/5 hover:border-primary hover:text-primary"
                  >
                    Ver detalle
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
