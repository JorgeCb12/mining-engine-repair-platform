import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Orden } from "../../types";
import { formatLocalDate } from "../../utils/formatDate";

interface OrdersTableProps {
  ordenes: Orden[];
  isLoading: boolean;
}

const estadoClasses: Record<string, string> = {
  recibido: "bg-gray-100 text-gray-700",
  en_diagnostico: "bg-blue-100 text-blue-800",
  esperando_aprobacion: "bg-amber-100 text-amber-800",
  en_reparacion: "bg-orange-100 text-orange-800",
  en_pruebas: "bg-violet-100 text-violet-800",
  finalizado: "bg-green-100 text-green-800",
  entregado: "bg-teal-100 text-teal-800",
};

const EstadoBadge = ({ estado }: { estado: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${estadoClasses[estado] ?? "bg-gray-100 text-gray-700"}`}
  >
    <span className="mr-1.5 size-1.5 rounded-full bg-current" aria-hidden="true" />
    {estado.replaceAll("_", " ")}
  </span>
);

const tableHead =
  "whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase";
const tableCell = "px-5 py-4 align-middle text-sm";

export const OrdersTable = ({ ordenes, isLoading }: OrdersTableProps) => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Nº Orden", "Estado", "Descripción", "Fecha de recepción", "Detalle"].map(
              (heading) => (
                <th key={heading} scope="col" className={tableHead}>
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {isLoading ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-12 text-center text-sm text-gray-500"
              >
                Cargando órdenes...
              </td>
            </tr>
          ) : ordenes.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-12 text-center text-sm text-gray-500"
              >
                No hay órdenes que coincidan con los filtros.
              </td>
            </tr>
          ) : (
            ordenes.map((orden) => (
              <tr key={orden.id} className="transition-colors hover:bg-gray-50">
                <td className={`${tableCell} whitespace-nowrap font-semibold text-gray-900`}>
                  {orden.numero_orden}
                </td>
                <td className={tableCell}>
                  <EstadoBadge estado={orden.estado_actual} />
                </td>
                <td className={`${tableCell} min-w-56 text-gray-600`}>
                  {orden.descripcion_falla}
                </td>
                <td className={`${tableCell} whitespace-nowrap text-gray-500`}>
                  {formatLocalDate(orden.fecha_recepcion)}
                </td>
                <td className={tableCell}>
                  <Link
                    to={`/ordenes/${orden.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                  >
                    Ver detalle
                    <ArrowUpRight size={15} aria-hidden="true" />
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
