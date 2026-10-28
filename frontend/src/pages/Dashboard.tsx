import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ListFilter, Search } from "lucide-react";
import { businessApi } from "../api/client";
import { CreateOrderForm } from "../components/dashboard/CreateOrderForm";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { OrdersTable } from "../components/dashboard/OrdersTable";
import type { Cliente, Motor, Orden } from "../types";

const estados = [
  "recibido",
  "en_diagnostico",
  "esperando_aprobacion",
  "en_reparacion",
  "en_pruebas",
  "finalizado",
  "entregado",
] as const;

export const Dashboard = () => {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [motores, setMotores] = useState<Motor[]>([]);
  const [form, setForm] = useState({
    motor_id: "",
    cliente_id: "",
    descripcion_falla: "",
    costo_estimado: "",
  });
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const [ordenesRes, clientesRes, motoresRes] = await Promise.all([
          businessApi.get<Orden[]>("/ordenes/"),
          businessApi.get<Cliente[]>("/clientes/"),
          businessApi.get<Motor[]>("/motores/"),
        ]);
        if (!ignore) {
          setOrdenes(ordenesRes.data);
          setClientes(clientesRes.data);
          setMotores(motoresRes.data);
        }
      } catch {
        if (!ignore) {
          setError("No se pudieron cargar las órdenes, clientes y motores.");
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

  const ordenesFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    return ordenes.filter((orden) => {
      const coincideEstado =
        filtroEstado === "" || orden.estado_actual === filtroEstado;
      const coincideBusqueda =
        termino === "" ||
        orden.numero_orden.toLocaleLowerCase().includes(termino) ||
        orden.descripcion_falla.toLocaleLowerCase().includes(termino);
      return coincideEstado && coincideBusqueda;
    });
  }, [ordenes, filtroEstado, busqueda]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreando(true);
    setError("");

    try {
      await businessApi.post<Orden>("/ordenes/", form);
      const res = await businessApi.get<Orden[]>("/ordenes/");
      setOrdenes(res.data);
      setForm({
        motor_id: "",
        cliente_id: "",
        descripcion_falla: "",
        costo_estimado: "",
      });
    } catch {
      setError(
        "No se pudo crear la orden. Verifica los datos e inténtalo de nuevo.",
      );
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 font-sans text-gray-900 sm:px-6 lg:px-8">
      <header>
        <p className="mb-1 text-xs font-bold tracking-[0.16em] text-blue-600 uppercase">
          Panel de administración
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard de reparaciones
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Supervisa y administra las órdenes de servicio en un solo lugar.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <DashboardStats ordenes={ordenes} />

      <CreateOrderForm
        clientes={clientes}
        motores={motores}
        form={form}
        setForm={setForm}
        onCreateOrder={handleCreate}
        isCreating={creando}
        isLoading={cargando}
      />

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Órdenes de reparación
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Mostrando{" "}
              <span className="font-semibold text-gray-700">
                {ordenesFiltradas.length}
              </span>{" "}
              de {ordenes.length} órdenes
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative flex min-h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-gray-400 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
              <ListFilter size={17} aria-hidden="true" />
              <select
                value={filtroEstado}
                onChange={(event) => setFiltroEstado(event.target.value)}
                aria-label="Filtrar órdenes por estado"
                className="min-w-44 flex-1 appearance-none bg-transparent py-2 pr-2 text-sm font-medium text-gray-700 outline-none"
              >
                <option value="">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-h-11 min-w-56 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-gray-400 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 sm:w-72">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar orden..."
                aria-label="Buscar por número o descripción"
                className="w-full bg-transparent py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </label>
          </div>
        </div>

        <OrdersTable ordenes={ordenesFiltradas} isLoading={cargando} />
      </section>
    </div>
  );
};
