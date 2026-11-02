import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  LoaderCircle,
  MessageSquareText,
  PackageCheck,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { businessApi } from "../api/client";
import { formatLocalDate } from "../utils/formatDate";
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
  recibido: "border border-slate-200 bg-slate-100 text-slate-700",
  en_diagnostico: "border border-blue-200 bg-blue-50 text-blue-800",
  esperando_aprobacion: "border border-amber-200 bg-amber-50 text-amber-800",
  en_reparacion: "border border-orange-200 bg-orange-50 text-orange-800",
  en_pruebas: "border border-purple-200 bg-purple-50 text-purple-800",
  finalizado: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  entregado: "border border-teal-200 bg-teal-50 text-teal-800",
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
  "rounded-lg glass-card p-5 sm:p-6";
const fieldClass = "grid gap-2 text-xs font-semibold uppercase tracking-wider text-muted";
const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-app outline-none transition placeholder:text-muted/50 focus:ring-1 focus:ring-primary focus:border-primary";

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
      toast.error("No se encontró el identificador de la orden.");
      return;
    }

    setActualizando(true);
    try {
      await businessApi.patch(`/ordenes/${id}/estado`, {
        estado_nuevo: estado,
        comentario,
      });
      setComentario("");
      setReloadKey((key) => key + 1);
      toast.success("Estado actualizado y guardado en el historial");
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? (err.response?.data?.detail as string) : undefined;
      toast.error(msg || "Error al actualizar el estado");
    } finally {
      setActualizando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al listado de órdenes
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app font-display">
            {orden ? <>Orden de Reparación <span className="font-mono">{orden.numero_orden}</span></> : "Detalle de Orden"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Seguimiento técnico, historial de estados y diagnóstico del motor.
          </p>
        </div>
        {orden && <EstadoBadge estado={orden.estado_actual} />}
      </header>

      {cargando && !orden ? (
        <div
          role="status"
          className="grid min-h-56 place-items-center rounded-lg glass-card text-sm text-muted"
        >
          <span className="flex flex-col items-center gap-3">
            <LoaderCircle
              size={28}
              aria-hidden="true"
              className="animate-spin text-primary"
            />
            Cargando información de la orden...
          </span>
        </div>
      ) : orden ? (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="grid size-11 place-items-center rounded-xl bg-white/5 text-primary">
                  <Wrench size={21} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium text-muted">
                    Número de orden
                  </p>
                  <h2 className="mt-0.5 text-xl font-bold text-app">
                    {orden.numero_orden}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/5 p-4 sm:col-span-1 border border-white/10">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
                    <Clock3 size={15} aria-hidden="true" />
                    Fecha de recepción
                  </p>
                  <p className="text-sm font-semibold text-app">
                    {formatLocalDate(orden.fecha_recepcion)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 sm:col-span-2 border border-white/10">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
                    <FileText size={15} aria-hidden="true" />
                    Descripción de la falla
                  </p>
                  <p className="text-sm leading-6 text-app/90">
                    {orden.descripcion_falla}
                  </p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg glass-card">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/5 text-primary">
                    <ClipboardList size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-app">
                      Historial de estados
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">
                      Registro de cambios de esta orden
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-app">
                  {historial.length}{" "}
                  {historial.length === 1 ? "cambio" : "cambios"}
                </span>
              </div>

              {historial.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                  <PackageCheck
                    size={28}
                    aria-hidden="true"
                    className="text-muted"
                  />
                  <p className="font-medium text-app">
                    Todavía no hay cambios registrados
                  </p>
                  <p className="text-sm text-muted">
                    Cuando se actualice el estado, aparecerá aquí.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-transparent">
                      <tr>
                        {["Cambio de estado", "Comentario", "Fecha y hora"].map(
                          (heading) => (
                            <th
                              key={heading}
                              scope="col"
                              className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted uppercase sm:px-5 border-b border-white/10"
                            >
                              {heading}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {historial.map((cambio) => (
                        <tr
                          key={cambio.id}
                          className="transition-colors hover:bg-white/5"
                        >
                          <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                            <span className="inline-flex items-center gap-2">
                              <EstadoBadge estado={cambio.estado_anterior} />
                              <ArrowRight
                                size={14}
                                aria-hidden="true"
                                className="text-muted"
                              />
                              <EstadoBadge estado={cambio.estado_nuevo} />
                            </span>
                          </td>
                          <td className="min-w-48 px-4 py-4 text-sm text-app/90 sm:px-5">
                            {cambio.comentario || "Sin comentario"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-muted sm:px-5">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays
                                size={15}
                                aria-hidden="true"
                                className="text-muted"
                              />
                              {formatLocalDate(cambio.timestamp)}
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
              <span className="grid size-10 place-items-center rounded-xl bg-white/5 text-primary">
                <RefreshCw size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold text-app">
                  Actualizar estado
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Registra el próximo avance.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className={fieldClass}>
                Nuevo estado
                <div className="relative">
                  <select
                    value={estado}
                    onChange={(event) => setEstado(event.target.value)}
                    aria-label="Nuevo estado"
                    className={`${inputClass} appearance-none pr-10`}
                    required
                  >
                    {estados.map((opcion) => (
                      <option key={opcion} value={opcion} className="bg-slate-900 text-slate-200 py-2">
                        {opcion.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                </div>
              </label>

              <label className={fieldClass}>
                Comentario
                <span className="relative block">
                  <MessageSquareText
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-3.5 left-3.5 text-muted"
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-brand-bg shadow-sm transition hover:bg-opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-white/5 disabled:text-muted"
              >
                {actualizando ? (
                  <>
                    <LoaderCircle
                      size={17}
                      aria-hidden="true"
                      className="animate-spin text-brand-bg"
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
          <section className="flex flex-col items-center gap-3 rounded-lg glass-card px-6 py-12 text-center">
            <PackageCheck
              size={32}
              aria-hidden="true"
              className="text-muted"
            />
            <h2 className="text-lg font-semibold text-app">
              No se encontró la orden
            </h2>
            <p className="text-sm text-muted">
              Comprueba el enlace o vuelve al listado de órdenes.
            </p>
            <Link
              to="/dashboard"
              className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
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
