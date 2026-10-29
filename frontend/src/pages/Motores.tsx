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
};

const fieldClass = "grid gap-2 text-sm font-medium text-gray-700";
const controlClass =
  "w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60";

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

export const Motores = () => {
  const [motores, setMotores] = useState<Motor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<MotorForm>(initialForm);
  const [editingMotor, setEditingMotor] = useState<Motor | null>(null);
  const [editForm, setEditForm] = useState<MotorForm>(initialForm);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
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
    setError("");
    setMensaje("");

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
      setMensaje("El motor se actualizó correctamente.");

      try {
        const res = await businessApi.get<Motor[]>("/motores/");
        setMotores(res.data);
      } catch {
        setError(
          "El motor se actualizó, pero no se pudo actualizar la lista. Recarga la página para ver los cambios.",
        );
      }
    } catch {
      setErrorEdicion(
        "No se pudo actualizar el motor. Verifica los datos, el cliente y que el número de serie no esté registrado en otro motor.",
      );
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreando(true);
    setError("");
    setMensaje("");

    try {
      const payload = {
        ...form,
        potencia_hp: Number(form.potencia_hp),
        horas_de_uso: Number(form.horas_de_uso),
      };
      await businessApi.post<Motor>("/motores/", payload);
      setForm(initialForm);
      setMensaje("El motor se registró correctamente.");

      try {
        const res = await businessApi.get<Motor[]>("/motores/");
        setMotores(res.data);
      } catch {
        setError(
          "El motor se creó, pero no se pudo actualizar la lista. Recarga la página para ver los cambios.",
        );
      }
    } catch {
      setError(
        "No se pudo crear el motor. Verifica los datos, el cliente y que el número de serie no esté registrado.",
      );
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 font-sans text-gray-900 sm:px-6 lg:px-8">
      <header>
        <p className="text-xs font-bold tracking-[0.16em] text-blue-600 uppercase">
          Gestión de activos
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Motores</h1>
        <p className="mt-2 text-sm text-gray-500">
          Controla los equipos, su estado y su ubicación en el taller.
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
        aria-label="Resumen de motores"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Total de motores"
          value={motores.length}
          icon={<Cog size={21} aria-hidden="true" />}
          color="text-blue-600"
          iconBackground="bg-blue-50"
        />
        <StatCard
          label="Motores activos"
          value={motoresActivos}
          icon={<Check size={21} aria-hidden="true" />}
          color="text-green-600"
          iconBackground="bg-green-50"
        />
        <StatCard
          label="Tipos de motor"
          value={tiposMotor}
          icon={<Gauge size={21} aria-hidden="true" />}
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
              <h2 className="font-semibold text-gray-900">Registrar motor</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Añade un equipo y asígnalo a un cliente.
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
                  <select
                    className={controlClass}
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
                    <option value="">
                      {cargando
                        ? "Cargando clientes..."
                        : clientes.length === 0
                          ? "No hay clientes disponibles"
                          : "Selecciona un cliente"}
                    </option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.razon_social} — {cliente.numero_identificacion}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400">
                <span className="text-red-500">*</span> Campos obligatorios
              </p>
              <button
                type="submit"
                disabled={creando || cargando || clientes.length === 0}
                className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none"
              >
                {creando ? "Guardando..." : <><Plus size={17} /> Crear motor</>}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-semibold text-gray-900">Inventario de motores</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {motoresFiltrados.length}{" "}
              {motoresFiltrados.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>
          <label className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-gray-400 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 sm:max-w-xs">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar motor..."
              aria-label="Buscar motores"
              className="w-full bg-transparent py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Motor", "Nº de serie", "Tipo / potencia", "Horas", "Ubicación", "Estado", "Acciones"].map(
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
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500">
                    Cargando motores...
                  </td>
                </tr>
              ) : motoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500">
                    {busqueda
                      ? "No encontramos motores con esa búsqueda."
                      : "Aún no hay motores registrados."}
                  </td>
                </tr>
              ) : (
                motoresFiltrados.map((motor) => (
                  <tr
                    key={motor.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="min-w-52 px-5 py-4 text-sm">
                      <p className="font-semibold text-gray-900">
                        {motor.fabricante} {motor.modelo}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {motor.codigo_interno}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-700">
                      {motor.numero_serie}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <span className="font-medium text-gray-700">
                        {motor.tipo_motor}
                      </span>
                      <span className="text-gray-500">
                        {" "}
                        · {motor.potencia_hp.toLocaleString()} HP
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {motor.horas_de_uso.toLocaleString()} h
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} aria-hidden="true" className="text-gray-400" />
                        {motor.ubicacion_actual}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          motor.estado_activo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                        {motor.estado_activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(motor)}
                        aria-label={`Editar ${motor.fabricante} ${motor.modelo}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                      >
                        <Pencil size={15} aria-hidden="true" />
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
                <select
                  className={controlClass}
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
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.razon_social} — {cliente.numero_identificacion}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setEditingMotor(null)}
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoEdicion || cargando || clientes.length === 0}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
