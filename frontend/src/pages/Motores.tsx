import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Cog,
  Gauge,
  MapPin,
  Pencil,
  Plus,
  Search,
  Truck,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { businessApi } from "../api/client";
import { Modal } from "../components/ui/Modal";
import type { Cliente, Motor } from "../types";

interface MotorForm {
  codigo_interno: string;
  numero_serie: string;
  fabricante: string;
  modelo: string;
  tipo_motor: string;
  potencia_hp: string;
  horas_de_uso: string;
  ubicacion_actual: string;
  cliente_propietario_id: string;
  estado_activo: boolean;
}

const initialForm: MotorForm = {
  codigo_interno: "",
  numero_serie: "",
  fabricante: "",
  modelo: "",
  tipo_motor: "Diesel",
  potencia_hp: "",
  horas_de_uso: "0",
  ubicacion_actual: "",
  cliente_propietario_id: "",
  estado_activo: true,
};

const fieldClass = "grid gap-2 text-xs font-semibold uppercase tracking-wider text-muted";
const controlClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-app outline-none transition placeholder:text-muted/50 focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-60";

const FormField = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) => (
  <label className={fieldClass}>
    <span className="flex items-center gap-2 text-app">
      <span className="text-muted" aria-hidden="true">
        {icon}
      </span>
      {label} <span className="text-primary">*</span>
    </span>
    {children}
  </label>
);

const StatCard = ({
  label,
  value,
  icon,
  color,
  iconBackground,
  border,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  iconBackground: string;
  border: string;
}) => (
  <article className={`rounded-lg glass-card ${border} p-5`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted uppercase">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-app font-mono">
          {value}
        </p>
      </div>
      <span className={`grid size-12 place-items-center rounded-lg ${iconBackground} ${color}`}>
        {icon}
      </span>
    </div>
  </article>
);

export const Motores = () => {
  const [motores, setMotores] = useState<Motor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<MotorForm>(initialForm);
  const [editingMotor, setEditingMotor] = useState<Motor | null>(null);
  const [editForm, setEditForm] = useState<MotorForm>(initialForm);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [formAbierto, setFormAbierto] = useState(true);
  const [error, setError] = useState("");
  const [errorEdicion, setErrorEdicion] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const [motoresRes, clientesRes] = await Promise.all([
          businessApi.get<Motor[]>("/motores/"),
          businessApi.get<Cliente[]>("/clientes/"),
        ]);
        if (!ignore) {
          setMotores(motoresRes.data);
          setClientes(clientesRes.data);
        }
      } catch {
        if (!ignore) {
          setError("No se pudieron cargar los motores y clientes.");
        }
      } finally {
        if (!ignore) setCargando(false);
      }
    };

    void fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  const motoresFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    if (!termino) return motores;

    return motores.filter((motor) =>
      [
        motor.codigo_interno,
        motor.numero_serie,
        motor.fabricante,
        motor.modelo,
        motor.tipo_motor,
        motor.ubicacion_actual,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(termino),
    );
  }, [motores, busqueda]);

  const motoresActivos = motores.filter((motor) => motor.estado_activo).length;
  const tiposMotor = new Set(motores.map((motor) => motor.tipo_motor)).size;

  const handleEdit = (motor: Motor) => {
    setEditingMotor(motor);
    setEditForm({
      codigo_interno: motor.codigo_interno,
      numero_serie: motor.numero_serie,
      fabricante: motor.fabricante,
      modelo: motor.modelo,
      tipo_motor: motor.tipo_motor,
      potencia_hp: String(motor.potencia_hp),
      horas_de_uso: String(motor.horas_de_uso),
      ubicacion_actual: motor.ubicacion_actual,
      cliente_propietario_id: motor.cliente_propietario_id,
      estado_activo: motor.estado_activo,
    });
    setErrorEdicion("");
    setError("");
    setMensaje("");
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingMotor) return;

    setGuardandoEdicion(true);
    setErrorEdicion("");

    try {
      const payload = {
        ...editForm,
        potencia_hp: Number(editForm.potencia_hp),
        horas_de_uso: Number(editForm.horas_de_uso),
      };
      await businessApi.put<Motor>(
        `/motores/${editingMotor.id}`,
        payload,
      );
      setEditingMotor(null);
      toast.success("Motor actualizado correctamente");

      try {
        const res = await businessApi.get<Motor[]>("/motores/");
        setMotores(res.data);
      } catch {
        toast.error("El motor se actualizó, pero no se pudo actualizar la lista.");
      }
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? (err.response?.data?.detail as string) : undefined;
      toast.error(msg || "Error al actualizar el motor");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        potencia_hp: Number(form.potencia_hp),
        horas_de_uso: Number(form.horas_de_uso),
      };
      await businessApi.post<Motor>("/motores/", payload);
      setForm(initialForm);
      toast.success("Motor registrado exitosamente");

      try {
        const res = await businessApi.get<Motor[]>("/motores/");
        setMotores(res.data);
      } catch {
        toast.error("El motor se creó, pero no se pudo actualizar la lista.");
      }
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? (err.response?.data?.detail as string) : undefined;
      toast.error(msg || "Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app font-display">
            Inventario de Motores
          </h1>
          <p className="mt-1 text-sm text-muted">
            Control de equipos pesados, especificaciones técnicas y ubicación en taller.
          </p>
        </div>
      </header>

      {(error || mensaje) && (
        <div
          role={error ? "alert" : "status"}
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {!error && <Check size={18} aria-hidden="true" />}
          {error || mensaje}
        </div>
      )}

      <section
        aria-label="Resumen de motores"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Total Motores"
          value={cargando ? "—" : motores.length}
          icon={<Cog size={22} aria-hidden="true" />}
          color="text-primary"
          iconBackground="bg-primary/10"
          border="border-l-4 border-brand-primary"
        />
        <StatCard
          label="Motores Activos"
          value={cargando ? "—" : motoresActivos}
          icon={<Check size={22} aria-hidden="true" />}
          color="text-emerald-400"
          iconBackground="bg-emerald-500/10"
          border="border-l-4 border-emerald-500"
        />
        <StatCard
          label="Tipos de Motor"
          value={cargando ? "—" : tiposMotor}
          icon={<Gauge size={22} aria-hidden="true" />}
          color="text-amber-400"
          iconBackground="bg-amber-500/10"
          border="border-l-4 border-amber-500"
        />
      </section>

      <section className="overflow-hidden rounded-lg glass-card">
        <div
          className={`flex items-center justify-between gap-4 bg-white/5 px-5 py-4 sm:px-6 ${
            formAbierto ? "border-b border-white/10" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/5 text-primary font-bold">
              <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-app">
                Registrar Nuevo Motor
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Añada las especificaciones técnicas del motor y asígnelo al cliente propietario.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormAbierto((abierto) => !abierto)}
            aria-expanded={formAbierto}
            aria-label={formAbierto ? "Ocultar formulario" : "Mostrar formulario"}
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/20 bg-transparent text-app transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ChevronDown
              size={18}
              aria-hidden="true"
              className={`transition-transform ${formAbierto ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {formAbierto && (
          <form onSubmit={handleCreate} className="grid gap-5 p-5 sm:p-6 bg-transparent">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="Código interno" icon={<Cog size={16} />}>
                <input
                  className={controlClass}
                  value={form.codigo_interno}
                  onChange={(event) =>
                    setForm({ ...form, codigo_interno: event.target.value })
                  }
                  placeholder="Ej. MOT-001"
                  required
                />
              </FormField>
              <FormField label="Número de serie" icon={<Truck size={16} />}>
                <input
                  className={controlClass}
                  value={form.numero_serie}
                  onChange={(event) =>
                    setForm({ ...form, numero_serie: event.target.value })
                  }
                  placeholder="Número único del equipo"
                  required
                />
              </FormField>
              <FormField label="Fabricante" icon={<Cog size={16} />}>
                <input
                  className={controlClass}
                  value={form.fabricante}
                  onChange={(event) =>
                    setForm({ ...form, fabricante: event.target.value })
                  }
                  placeholder="Ej. Caterpillar"
                  required
                />
              </FormField>
              <FormField label="Modelo" icon={<Cog size={16} />}>
                <input
                  className={controlClass}
                  value={form.modelo}
                  onChange={(event) =>
                    setForm({ ...form, modelo: event.target.value })
                  }
                  placeholder="Ej. 3512B"
                  required
                />
              </FormField>
              <FormField label="Tipo de motor" icon={<Gauge size={16} />}>
                <input
                  className={controlClass}
                  value={form.tipo_motor}
                  onChange={(event) =>
                    setForm({ ...form, tipo_motor: event.target.value })
                  }
                  placeholder="Ej. Diesel"
                  required
                />
              </FormField>
              <FormField label="Potencia (HP)" icon={<Gauge size={16} />}>
                <input
                  className={controlClass}
                  type="number"
                  min="1"
                  step="1"
                  value={form.potencia_hp}
                  onChange={(event) =>
                    setForm({ ...form, potencia_hp: event.target.value })
                  }
                  placeholder="Ej. 1000"
                  inputMode="numeric"
                  required
                />
              </FormField>
              <FormField label="Horas de uso" icon={<Gauge size={16} />}>
                <input
                  className={controlClass}
                  type="number"
                  min="0"
                  step="1"
                  value={form.horas_de_uso}
                  onChange={(event) =>
                    setForm({ ...form, horas_de_uso: event.target.value })
                  }
                  placeholder="Ej. 0"
                  inputMode="numeric"
                  required
                />
              </FormField>
              <FormField label="Ubicación actual" icon={<MapPin size={16} />}>
                <input
                  className={controlClass}
                  value={form.ubicacion_actual}
                  onChange={(event) =>
                    setForm({ ...form, ubicacion_actual: event.target.value })
                  }
                  placeholder="Ej. Taller central"
                  required
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField
                  label="Cliente propietario"
                  icon={<UsersRound size={16} />}
                >
                  <div className="relative">
                    <select
                      className={`${controlClass} appearance-none pr-10`}
                      value={form.cliente_propietario_id}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          cliente_propietario_id: event.target.value,
                        })
                      }
                      required
                      disabled={cargando || clientes.length === 0}
                    >
                      <option value="" className="bg-slate-900 text-slate-200 py-2">
                        {cargando
                          ? "Cargando clientes..."
                          : clientes.length === 0
                            ? "No hay clientes disponibles"
                            : "Selecciona un cliente"}
                      </option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id} className="bg-slate-900 text-slate-200 py-2">
                          {cliente.razon_social} — {cliente.numero_identificacion}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                  </div>
                </FormField>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
              <p className="text-xs text-muted">
                <span className="text-primary">*</span> Campos obligatorios
              </p>
              <button
                type="submit"
                disabled={isSubmitting || cargando || clientes.length === 0}
                className="inline-flex min-w-44 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-bg shadow-sm transition hover:bg-opacity-90 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-white/5 disabled:text-muted"
              >
                {isSubmitting ? "Registrando..." : <><Plus size={16} /> Crear motor</>}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="overflow-hidden rounded-lg glass-card">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 bg-white/5 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-app">Inventario de Motores</h2>
            <p className="mt-0.5 text-xs text-muted">
              {motoresFiltrados.length}{" "}
              {motoresFiltrados.length === 1 ? "resultado encontrado" : "resultados encontrados"}
            </p>
          </div>
          <label className="flex min-h-10 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-muted shadow-sm transition focus-within:ring-1 focus-within:ring-primary focus-within:border-primary sm:max-w-xs">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar motor..."
              aria-label="Buscar motores"
              className="w-full bg-transparent py-1.5 text-xs text-app outline-none placeholder:text-muted/50"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-transparent">
              <tr>
                {["Motor", "Nº de serie", "Tipo / potencia", "Horas", "Ubicación", "Estado", "Acciones"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted uppercase border-b border-white/10"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {cargando ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="bg-transparent">
                    <td className="px-4 py-3"><div className="h-4 w-36 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-16 bg-white/10 rounded-full animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-white/10 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : motoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="mx-auto flex flex-col items-center justify-center">
                      <Cog size={48} className="text-muted mb-3" aria-hidden="true" />
                      <p className="text-base font-semibold text-app">No se encontraron motores</p>
                      <p className="mt-1 text-xs text-muted">
                        {busqueda
                          ? "Intenta con otros términos de búsqueda."
                          : "Aún no hay motores registrados."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                motoresFiltrados.map((motor) => (
                  <tr
                    key={motor.id}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="min-w-52 px-4 py-3 text-xs">
                      <p className="font-bold text-app text-sm">
                        {motor.fabricante} {motor.modelo}
                      </p>
                      <p className="mt-0.5 text-muted font-mono text-[11px]">
                        {motor.codigo_interno}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-mono font-medium text-app/90">
                      {motor.numero_serie}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      <span className="font-semibold text-app">
                        {motor.tipo_motor}
                      </span>
                      <span className="text-muted">
                        {" "}
                        · {motor.potencia_hp.toLocaleString()} HP
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-muted">
                      {motor.horas_de_uso.toLocaleString()} h
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <MapPin size={13} aria-hidden="true" className="text-muted" />
                        {motor.ubicacion_actual}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          motor.estado_activo
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border border-white/10 bg-white/5 text-muted"
                        }`}
                      >
                        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                        {motor.estado_activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(motor)}
                        aria-label={`Editar ${motor.fabricante} ${motor.modelo}`}
                        className="inline-flex items-center gap-1.5 rounded border border-white/20 bg-transparent px-2.5 py-1.5 text-xs font-semibold text-app transition hover:bg-white/5 hover:border-primary hover:text-primary"
                      >
                        <Pencil size={13} aria-hidden="true" />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={editingMotor !== null}
        onClose={() => setEditingMotor(null)}
        title="Editar motor"
      >
        <form onSubmit={handleUpdate} className="grid gap-5">
          {errorEdicion && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {errorEdicion}
            </p>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Código interno" icon={<Cog size={16} />}>
              <input
                className={controlClass}
                value={editForm.codigo_interno}
                onChange={(event) =>
                  setEditForm({ ...editForm, codigo_interno: event.target.value })
                }
                required
              />
            </FormField>
            <FormField label="Número de serie" icon={<Truck size={16} />}>
              <input
                className={controlClass}
                value={editForm.numero_serie}
                onChange={(event) =>
                  setEditForm({ ...editForm, numero_serie: event.target.value })
                }
                required
              />
            </FormField>
            <FormField label="Fabricante" icon={<Cog size={16} />}>
              <input
                className={controlClass}
                value={editForm.fabricante}
                onChange={(event) =>
                  setEditForm({ ...editForm, fabricante: event.target.value })
                }
                required
              />
            </FormField>
            <FormField label="Modelo" icon={<Cog size={16} />}>
              <input
                className={controlClass}
                value={editForm.modelo}
                onChange={(event) =>
                  setEditForm({ ...editForm, modelo: event.target.value })
                }
                required
              />
            </FormField>
            <FormField label="Tipo de motor" icon={<Gauge size={16} />}>
              <input
                className={controlClass}
                value={editForm.tipo_motor}
                onChange={(event) =>
                  setEditForm({ ...editForm, tipo_motor: event.target.value })
                }
                required
              />
            </FormField>
            <FormField label="Potencia (HP)" icon={<Gauge size={16} />}>
              <input
                className={controlClass}
                type="number"
                min="1"
                step="1"
                value={editForm.potencia_hp}
                onChange={(event) =>
                  setEditForm({ ...editForm, potencia_hp: event.target.value })
                }
                inputMode="numeric"
                required
              />
            </FormField>
            <FormField label="Horas de uso" icon={<Gauge size={16} />}>
              <input
                className={controlClass}
                type="number"
                min="0"
                step="1"
                value={editForm.horas_de_uso}
                onChange={(event) =>
                  setEditForm({ ...editForm, horas_de_uso: event.target.value })
                }
                inputMode="numeric"
                required
              />
            </FormField>
            <FormField label="Ubicación actual" icon={<MapPin size={16} />}>
              <input
                className={controlClass}
                value={editForm.ubicacion_actual}
                onChange={(event) =>
                  setEditForm({ ...editForm, ubicacion_actual: event.target.value })
                }
                required
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField
                label="Cliente propietario"
                icon={<UsersRound size={16} />}
              >
                <div className="relative">
                  <select
                    className={`${controlClass} appearance-none pr-10`}
                    value={editForm.cliente_propietario_id}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        cliente_propietario_id: event.target.value,
                      })
                    }
                    required
                    disabled={cargando || clientes.length === 0}
                  >
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id} className="bg-slate-900 text-slate-200 py-2">
                        {cliente.razon_social} — {cliente.numero_identificacion}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                </div>
              </FormField>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="edit_motor_estado_activo"
                checked={editForm.estado_activo}
                onChange={(event) =>
                  setEditForm({ ...editForm, estado_activo: event.target.checked })
                }
                className="size-4 rounded border-white/20 bg-app text-primary focus:ring-primary accent-emerald-500"
              />
              <label htmlFor="edit_motor_estado_activo" className="text-xs font-semibold uppercase tracking-wider text-muted cursor-pointer select-none">
                Motor Activo
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setEditingMotor(null)}
              className="rounded-lg border border-white/20 bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-app transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-primary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoEdicion || cargando || clientes.length === 0}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-bg shadow-sm transition hover:bg-opacity-95 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-white/5 disabled:text-muted"
            >
              {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
