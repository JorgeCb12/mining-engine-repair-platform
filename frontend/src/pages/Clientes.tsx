import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { businessApi } from "../api/client";
import { Modal } from "../components/ui/Modal";
import type { Cliente } from "../types";

interface ClienteForm {
  razon_social: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono: string;
  ubicacion: string;
  estado_activo: boolean;
}

const initialForm: ClienteForm = {
  razon_social: "",
  tipo_identificacion: "RUT",
  numero_identificacion: "",
  contacto_nombre: "",
  contacto_email: "",
  contacto_telefono: "",
  ubicacion: "",
  estado_activo: true,
};

const controlClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-app outline-none transition placeholder:text-muted/50 focus:ring-1 focus:ring-primary focus:border-primary";
const fieldClass = "grid gap-2 text-xs font-semibold uppercase tracking-wider text-muted";

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

export const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<ClienteForm>(initialForm);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editForm, setEditForm] = useState<ClienteForm>(initialForm);
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
        const res = await businessApi.get<Cliente[]>("/clientes/");
        if (!ignore) setClientes(res.data);
      } catch {
        if (!ignore) setError("No se pudo cargar la lista de clientes.");
      } finally {
        if (!ignore) setCargando(false);
      }
    };

    void fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    if (!termino) return clientes;

    return clientes.filter((cliente) =>
      [
        cliente.razon_social,
        cliente.numero_identificacion,
        cliente.contacto_nombre,
        cliente.contacto_email,
        cliente.ubicacion,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(termino),
    );
  }, [clientes, busqueda]);

  const clientesActivos = clientes.filter(
    (cliente) => cliente.estado_activo,
  ).length;

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setEditForm({
      razon_social: cliente.razon_social,
      tipo_identificacion: cliente.tipo_identificacion,
      numero_identificacion: cliente.numero_identificacion,
      contacto_nombre: cliente.contacto_nombre,
      contacto_email: cliente.contacto_email,
      contacto_telefono: cliente.contacto_telefono,
      ubicacion: cliente.ubicacion,
      estado_activo: cliente.estado_activo,
    });
    setErrorEdicion("");
    setError("");
    setMensaje("");
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCliente) return;

    setGuardandoEdicion(true);
    setErrorEdicion("");

    try {
      await businessApi.put<Cliente>(
        `/clientes/${editingCliente.id}`,
        editForm,
      );
      setEditingCliente(null);
      toast.success("Cliente actualizado correctamente");

      try {
        const res = await businessApi.get<Cliente[]>("/clientes/");
        setClientes(res.data);
      } catch {
        toast.error("El cliente se actualizó, pero no se pudo actualizar la lista.");
      }
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? (err.response?.data?.detail as string) : undefined;
      toast.error(msg || "Error al actualizar el cliente");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await businessApi.post<Cliente>("/clientes/", form);
      setForm(initialForm);
      toast.success("Cliente creado exitosamente");

      try {
        const res = await businessApi.get<Cliente[]>("/clientes/");
        setClientes(res.data);
      } catch {
        toast.error("El cliente se creó, pero no se pudo actualizar la lista.");
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
            Directorio de Clientes
          </h1>
          <p className="mt-1 text-sm text-muted">
            Gestión y registro de cuentas corporativas para reparaciones mineras.
          </p>
        </div>
      </header>

      {(error || mensaje) && (
        <div
          role={error ? "alert" : "status"}
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {!error && <Check size={18} aria-hidden="true" />}
          {error || mensaje}
        </div>
      )}

      <section
        aria-label="Resumen de clientes"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Total Clientes"
          value={cargando ? "—" : clientes.length}
          icon={<UsersRound size={22} aria-hidden="true" />}
          color="text-primary"
          iconBackground="bg-primary/10"
          border="border-l-4 border-brand-primary"
        />
        <StatCard
          label="Clientes Activos"
          value={cargando ? "—" : clientesActivos}
          icon={<Check size={22} aria-hidden="true" />}
          color="text-emerald-400"
          iconBackground="bg-emerald-500/10"
          border="border-l-4 border-emerald-500"
        />
        <StatCard
          label="Inactivos"
          value={cargando ? "—" : clientes.length - clientesActivos}
          icon={<Building2 size={22} aria-hidden="true" />}
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
                Registrar Nuevo Cliente
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Ingrese los datos fiscales y de contacto para dar de alta la cuenta.
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
              <FormField label="Razón social" icon={<Building2 size={16} />}>
                <input
                  className={controlClass}
                  value={form.razon_social}
                  onChange={(event) =>
                    setForm({ ...form, razon_social: event.target.value })
                  }
                  placeholder="Ej. Minera del Norte S.A."
                  autoComplete="organization"
                  required
                />
              </FormField>

              <FormField
                label="Tipo de identificación"
                icon={<UsersRound size={16} />}
              >
                <div className="relative">
                  <select
                    className={`${controlClass} appearance-none pr-10`}
                    value={form.tipo_identificacion}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        tipo_identificacion: event.target.value,
                      })
                    }
                    required
                  >
                    <option value="RUT" className="bg-slate-900 text-slate-200 py-2">RUT</option>
                    <option value="RUC" className="bg-slate-900 text-slate-200 py-2">RUC</option>
                    <option value="NIT" className="bg-slate-900 text-slate-200 py-2">NIT</option>
                    <option value="DNI" className="bg-slate-900 text-slate-200 py-2">DNI</option>
                    <option value="Otro" className="bg-slate-900 text-slate-200 py-2">Otro</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                </div>
              </FormField>

              <FormField
                label="Número de identificación"
                icon={<span className="font-bold">#</span>}
              >
                <input
                  className={controlClass}
                  value={form.numero_identificacion}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      numero_identificacion: event.target.value,
                    })
                  }
                  placeholder="Ingresa el número"
                  required
                />
              </FormField>

              <FormField
                label="Nombre de contacto"
                icon={<UsersRound size={16} />}
              >
                <input
                  className={controlClass}
                  value={form.contacto_nombre}
                  onChange={(event) =>
                    setForm({ ...form, contacto_nombre: event.target.value })
                  }
                  placeholder="Nombre y apellido"
                  autoComplete="name"
                  required
                />
              </FormField>

              <FormField label="Correo electrónico" icon={<Mail size={16} />}>
                <input
                  className={controlClass}
                  type="email"
                  value={form.contacto_email}
                  onChange={(event) =>
                    setForm({ ...form, contacto_email: event.target.value })
                  }
                  placeholder="contacto@empresa.com"
                  autoComplete="email"
                  required
                />
              </FormField>

              <FormField label="Teléfono" icon={<Phone size={16} />}>
                <input
                  className={controlClass}
                  type="tel"
                  value={form.contacto_telefono}
                  onChange={(event) =>
                    setForm({ ...form, contacto_telefono: event.target.value })
                  }
                  placeholder="+56 9 1234 5678"
                  autoComplete="tel"
                  required
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Ubicación" icon={<MapPin size={16} />}>
                  <input
                    className={controlClass}
                    value={form.ubicacion}
                    onChange={(event) =>
                      setForm({ ...form, ubicacion: event.target.value })
                    }
                    placeholder="Ciudad, región o dirección"
                    autoComplete="street-address"
                    required
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
              <p className="text-xs text-muted">
                <span className="text-primary">*</span> Campos obligatorios
              </p>
              <button
                type="submit"
                disabled={isSubmitting || cargando}
                className="inline-flex min-w-44 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-bg shadow-sm transition hover:bg-opacity-90 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-white/5 disabled:text-muted"
              >
                {isSubmitting ? "Registrando..." : <><Plus size={16} /> Crear cliente</>}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="overflow-hidden rounded-lg glass-card">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 bg-white/5 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-app">Directorio de Clientes</h2>
            <p className="mt-0.5 text-xs text-muted">
              {clientesFiltrados.length}{" "}
              {clientesFiltrados.length === 1 ? "resultado encontrado" : "resultados encontrados"}
            </p>
          </div>
          <label className="flex min-h-10 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-muted shadow-sm transition focus-within:ring-1 focus-within:ring-primary focus-within:border-primary sm:max-w-xs">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre o RUT..."
              aria-label="Buscar clientes"
              className="w-full bg-transparent py-1.5 text-xs text-app outline-none placeholder:text-muted/50"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-transparent">
              <tr>
                {["Cliente", "Identificación", "Contacto", "Ubicación", "Estado", "Acciones"].map(
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
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-40 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-16 bg-white/10 rounded-full animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-white/10 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="mx-auto flex flex-col items-center justify-center">
                      <UsersRound size={48} className="text-muted mb-3" aria-hidden="true" />
                      <p className="text-base font-semibold text-app">No se encontraron clientes</p>
                      <p className="mt-1 text-xs text-muted">
                        {busqueda
                          ? "Intenta con otros términos de búsqueda."
                          : "Registra tu primer cliente usando el formulario superior."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-app">
                      {cliente.razon_social}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                      <span className="font-semibold text-app">
                        {cliente.tipo_identificacion}
                      </span>{" "}
                      <span className="font-mono">{cliente.numero_identificacion}</span>
                    </td>
                    <td className="min-w-52 px-4 py-3 text-xs">
                      <p className="font-semibold text-app">
                        {cliente.contacto_nombre}
                      </p>
                      <a
                        href={`mailto:${cliente.contacto_email}`}
                        className="mt-0.5 block text-muted hover:text-app hover:underline"
                      >
                        {cliente.contacto_email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                      {cliente.ubicacion}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          cliente.estado_activo
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border border-white/10 bg-white/5 text-muted"
                        }`}
                      >
                        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                        {cliente.estado_activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(cliente)}
                        aria-label={`Editar ${cliente.razon_social}`}
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
        isOpen={editingCliente !== null}
        onClose={() => setEditingCliente(null)}
        title="Editar cliente"
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
            <FormField label="Razón social" icon={<Building2 size={16} />}>
              <input
                className={controlClass}
                value={editForm.razon_social}
                onChange={(event) =>
                  setEditForm({ ...editForm, razon_social: event.target.value })
                }
                autoComplete="organization"
                required
              />
            </FormField>
            <FormField
              label="Tipo de identificación"
              icon={<UsersRound size={16} />}
            >
              <div className="relative">
                <select
                  className={`${controlClass} appearance-none pr-10`}
                  value={editForm.tipo_identificacion}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      tipo_identificacion: event.target.value,
                    })
                  }
                  required
                >
                  <option value="RUT" className="bg-slate-900 text-slate-200 py-2">RUT</option>
                  <option value="RUC" className="bg-slate-900 text-slate-200 py-2">RUC</option>
                  <option value="NIT" className="bg-slate-900 text-slate-200 py-2">NIT</option>
                  <option value="DNI" className="bg-slate-900 text-slate-200 py-2">DNI</option>
                  <option value="Otro" className="bg-slate-900 text-slate-200 py-2">Otro</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
              </div>
            </FormField>
            <FormField
              label="Número de identificación"
              icon={<span className="font-bold">#</span>}
            >
              <input
                className={controlClass}
                value={editForm.numero_identificacion}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    numero_identificacion: event.target.value,
                  })
                }
                required
              />
            </FormField>
            <FormField label="Nombre de contacto" icon={<UsersRound size={16} />}>
              <input
                className={controlClass}
                value={editForm.contacto_nombre}
                onChange={(event) =>
                  setEditForm({ ...editForm, contacto_nombre: event.target.value })
                }
                autoComplete="name"
                required
              />
            </FormField>
            <FormField label="Correo electrónico" icon={<Mail size={16} />}>
              <input
                className={controlClass}
                type="email"
                value={editForm.contacto_email}
                onChange={(event) =>
                  setEditForm({ ...editForm, contacto_email: event.target.value })
                }
                autoComplete="email"
                required
              />
            </FormField>
            <FormField label="Teléfono" icon={<Phone size={16} />}>
              <input
                className={controlClass}
                type="tel"
                value={editForm.contacto_telefono}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    contacto_telefono: event.target.value,
                  })
                }
                autoComplete="tel"
                required
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Ubicación" icon={<MapPin size={16} />}>
                <input
                  className={controlClass}
                  value={editForm.ubicacion}
                  onChange={(event) =>
                    setEditForm({ ...editForm, ubicacion: event.target.value })
                  }
                  autoComplete="street-address"
                  required
                />
              </FormField>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="edit_estado_activo"
                checked={editForm.estado_activo}
                onChange={(event) =>
                  setEditForm({ ...editForm, estado_activo: event.target.checked })
                }
                className="size-4 rounded border-white/20 bg-app text-primary focus:ring-primary accent-emerald-500"
              />
              <label htmlFor="edit_estado_activo" className="text-xs font-semibold uppercase tracking-wider text-muted cursor-pointer select-none">
                Cliente Activo
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setEditingCliente(null)}
              className="rounded-lg border border-white/20 bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-app transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-primary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoEdicion}
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
