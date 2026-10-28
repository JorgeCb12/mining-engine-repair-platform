import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  UsersRound,
} from "lucide-react";
import { businessApi } from "../api/client";
import type { Cliente } from "../types";

interface ClienteForm {
  razon_social: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono: string;
  ubicacion: string;
}

const initialForm: ClienteForm = {
  razon_social: "",
  tipo_identificacion: "RUT",
  numero_identificacion: "",
  contacto_nombre: "",
  contacto_email: "",
  contacto_telefono: "",
  ubicacion: "",
};

const controlClass =
  "w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20";
const fieldClass = "grid gap-2 text-sm font-medium text-gray-700";

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
    <span className="flex items-center gap-2">
      <span className="text-gray-400" aria-hidden="true">
        {icon}
      </span>
      {label} <span className="text-red-500">*</span>
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
}: {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
  iconBackground: string;
}) => (
  <article className="flex flex-1 items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <span
      className={`grid size-11 shrink-0 place-items-center rounded-xl ${iconBackground} ${color}`}
    >
      {icon}
    </span>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
        {value}
      </p>
    </div>
  </article>
);

export const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<ClienteForm>(initialForm);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [formAbierto, setFormAbierto] = useState(true);
  const [error, setError] = useState("");
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

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreando(true);
    setError("");
    setMensaje("");

    try {
      await businessApi.post<Cliente>("/clientes/", form);
      setForm(initialForm);
      setMensaje("El cliente se creó correctamente.");

      try {
        const res = await businessApi.get<Cliente[]>("/clientes/");
        setClientes(res.data);
      } catch {
        setError(
          "El cliente se creó, pero no se pudo actualizar la lista. Recarga la página para ver los cambios.",
        );
      }
    } catch {
      setError(
        "No se pudo crear el cliente. Comprueba los datos y que el número de identificación no esté registrado.",
      );
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 font-sans text-gray-900 sm:px-6 lg:px-8">
      <header>
        <p className="text-xs font-bold tracking-[0.16em] text-blue-600 uppercase">
          Gestión comercial
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="mt-2 text-sm text-gray-500">
          Administra la información de tus clientes y sus contactos.
        </p>
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
          label="Total de clientes"
          value={clientes.length}
          icon={<UsersRound size={21} aria-hidden="true" />}
          color="text-blue-600"
          iconBackground="bg-blue-50"
        />
        <StatCard
          label="Clientes activos"
          value={clientesActivos}
          icon={<Check size={21} aria-hidden="true" />}
          color="text-green-600"
          iconBackground="bg-green-50"
        />
        <StatCard
          label="Inactivos"
          value={clientes.length - clientesActivos}
          icon={<Building2 size={21} aria-hidden="true" />}
          color="text-amber-600"
          iconBackground="bg-amber-50"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div
          className={`flex items-center justify-between gap-4 px-5 py-4 sm:px-6 ${
            formAbierto ? "border-b border-gray-100" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Plus size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-gray-900">Registrar cliente</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Completa la información para darlo de alta.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormAbierto((abierto) => !abierto)}
            aria-expanded={formAbierto}
            aria-label={formAbierto ? "Ocultar formulario" : "Mostrar formulario"}
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <ChevronDown
              size={18}
              aria-hidden="true"
              className={`transition-transform ${formAbierto ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {formAbierto && (
          <form onSubmit={handleCreate} className="grid gap-5 p-5 sm:p-6">
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
                <select
                  className={controlClass}
                  value={form.tipo_identificacion}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      tipo_identificacion: event.target.value,
                    })
                  }
                  required
                >
                  <option value="RUT">RUT</option>
                  <option value="RUC">RUC</option>
                  <option value="NIT">NIT</option>
                  <option value="DNI">DNI</option>
                  <option value="Otro">Otro</option>
                </select>
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

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400">
                <span className="text-red-500">*</span> Campos obligatorios
              </p>
              <button
                type="submit"
                disabled={creando || cargando}
                className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none"
              >
                {creando ? "Guardando..." : <><Plus size={17} /> Crear cliente</>}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-semibold text-gray-900">Directorio de clientes</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {clientesFiltrados.length}{" "}
              {clientesFiltrados.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>
          <label className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-gray-400 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 sm:max-w-xs">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar cliente..."
              aria-label="Buscar clientes"
              className="w-full bg-transparent py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Cliente", "Identificación", "Contacto", "Ubicación", "Estado"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-500">
                    Cargando clientes...
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-500">
                    {busqueda
                      ? "No encontramos clientes con esa búsqueda."
                      : "Aún no hay clientes registrados."}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">
                      {cliente.razon_social}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      <span className="text-gray-400">
                        {cliente.tipo_identificacion}
                      </span>{" "}
                      {cliente.numero_identificacion}
                    </td>
                    <td className="min-w-52 px-5 py-4 text-sm">
                      <p className="font-medium text-gray-800">
                        {cliente.contacto_nombre}
                      </p>
                      <a
                        href={`mailto:${cliente.contacto_email}`}
                        className="mt-1 block text-xs text-gray-500 hover:text-blue-600 hover:underline"
                      >
                        {cliente.contacto_email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {cliente.ubicacion}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          cliente.estado_activo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                        {cliente.estado_activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
