import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  FileText,
  LoaderCircle,
  MessageSquareText,
  PackageCheck,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { businessApi } from "../api/client";
import type { HistorialEstado, Orden } from "../types";

const estados = [
  "recibido",
  "en_diagnostico",
  "esperando_aprobacion",
  "en_reparacion",
  "en_pruebas",
  "finalizado",
  "entregado",
] as const;

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
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${estadoClasses[estado] ?? "bg-gray-100 text-gray-700"}`}
  >
    <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {estado.replaceAll("_", " ")}
  </span>
);

const cardClass =
  "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6";
const fieldClass = "grid gap-2 text-sm font-medium text-gray-700";
const inputClass =
  "w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20";

export const DetalleOrden = () => {
  const { id } = useParams<{ id: string }>();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [historial, setHistorial] = useState<HistorialEstado[]>([]);
  const [estado, setEstado] = useState<string>("recibido");
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setCargando(true);
      setError("");

      if (!id) {
        setError("No se encontró el identificador de la orden.");
        setCargando(false);
        return;
      }

      try {
        const [ordenRes, historialRes] = await Promise.all([
          businessApi.get<Orden>(`/ordenes/${id}`),
          businessApi.get<HistorialEstado[]>(`/ordenes/${id}/historial`),
        ]);
        if (!ignore) {
          setOrden(ordenRes.data);
          setEstado(ordenRes.data.estado_actual);
          setHistorial(historialRes.data);
        }
      } catch {
        if (!ignore) setError("No se pudo cargar la orden y su historial.");
      } finally {
        if (!ignore) setCargando(false);
      }
    };

    void fetchData();
    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) {
      setError("No se encontró el identificador de la orden.");
      return;
    }

    setActualizando(true);
    setError("");
    try {
      await businessApi.patch(`/ordenes/${id}/estado`, {
        estado_nuevo: estado,
        comentario,
      });
      setComentario("");
      setReloadKey((key) => key + 1);
    } catch {
      setError("No se pudo actualizar el estado de la orden.");
    } finally {
      setActualizando(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 font-sans text-gray-900 sm:px-6 lg:px-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Volver a órdenes
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-blue-600 uppercase">
            Gestión de servicio
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            {orden ? `Orden ${orden.numero_orden}` : "Detalle de orden"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Información y seguimiento de la reparación.
          </p>
        </div>
        {orden && <EstadoBadge estado={orden.estado_actual} />}
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {cargando && !orden ? (
        <div
          role="status"
          className="grid min-h-56 place-items-center rounded-2xl border border-gray-200 bg-white text-sm text-gray-500 shadow-sm"
        >
          <span className="flex flex-col items-center gap-3">
            <LoaderCircle
              size={28}
              aria-hidden="true"
              className="animate-spin text-blue-600"
            />
            Cargando información de la orden...
          </span>
        </div>
      ) : orden ? (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
                <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Wrench size={21} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Número de orden
                  </p>
                  <h2 className="mt-0.5 text-xl font-bold text-gray-900">
                    {orden.numero_orden}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-4 sm:col-span-1">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <Clock3 size={15} aria-hidden="true" />
                    Fecha de recepción
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(orden.fecha_recepcion).toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <FileText size={15} aria-hidden="true" />
                    Descripción de la falla
                  </p>
                  <p className="text-sm leading-6 text-gray-700">
                    {orden.descripcion_falla}
                  </p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <ClipboardList size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Historial de estados
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Registro de cambios de esta orden
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {historial.length}{" "}
                  {historial.length === 1 ? "cambio" : "cambios"}
                </span>
              </div>

              {historial.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                  <PackageCheck
                    size={28}
                    aria-hidden="true"
                    className="text-gray-300"
                  />
                  <p className="font-medium text-gray-700">
                    Todavía no hay cambios registrados
                  </p>
                  <p className="text-sm text-gray-500">
                    Cuando se actualice el estado, aparecerá aquí.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Cambio de estado", "Comentario", "Fecha y hora"].map(
                          (heading) => (
                            <th
                              key={heading}
                              scope="col"
                              className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase sm:px-5"
                            >
                              {heading}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {historial.map((cambio) => (
                        <tr
                          key={cambio.id}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                            <span className="inline-flex items-center gap-2">
                              <EstadoBadge estado={cambio.estado_anterior} />
                              <ArrowRight
                                size={14}
                                aria-hidden="true"
                                className="text-gray-400"
                              />
                              <EstadoBadge estado={cambio.estado_nuevo} />
                            </span>
                          </td>
                          <td className="min-w-48 px-4 py-4 text-sm text-gray-600 sm:px-5">
                            {cambio.comentario || "Sin comentario"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 sm:px-5">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays
                                size={15}
                                aria-hidden="true"
                                className="text-gray-400"
                              />
                              {new Date(cambio.timestamp).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <aside className={`${cardClass} md:sticky md:top-24`}>
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <RefreshCw size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Actualizar estado
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Registra el próximo avance.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className={fieldClass}>
                Nuevo estado
                <select
                  value={estado}
                  onChange={(event) => setEstado(event.target.value)}
                  aria-label="Nuevo estado"
                  className={inputClass}
                  required
                >
                  {estados.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className={fieldClass}>
                Comentario
                <span className="relative block">
                  <MessageSquareText
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-3.5 left-3.5 text-gray-400"
                  />
                  <textarea
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                    placeholder="Añade un comentario sobre este cambio..."
                    className={`${inputClass} min-h-28 resize-y pl-10`}
                    rows={4}
                    required
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={actualizando || cargando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none"
              >
                {actualizando ? (
                  <>
                    <LoaderCircle
                      size={17}
                      aria-hidden="true"
                      className="animate-spin"
                    />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Check size={17} aria-hidden="true" />
                    Actualizar estado
                  </>
                )}
              </button>
            </form>
          </aside>
        </div>
      ) : (
        !cargando && (
          <section className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
            <PackageCheck
              size={32}
              aria-hidden="true"
              className="text-gray-400"
            />
            <h2 className="text-lg font-semibold text-gray-900">
              No se encontró la orden
            </h2>
            <p className="text-sm text-gray-500">
              Comprueba el enlace o vuelve al listado de órdenes.
            </p>
            <Link
              to="/dashboard"
              className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Volver al dashboard
            </Link>
          </section>
        )
      )}
    </div>
  );
};
