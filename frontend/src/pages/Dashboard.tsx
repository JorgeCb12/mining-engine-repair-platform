import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ChevronDown, ListFilter, Search } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
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
      toast.success("Orden de reparación generada con éxito");
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? (err.response?.data?.detail as string) : undefined;
      const errorText = msg || "No se pudo crear la orden";
      setError(errorText);
      toast.error(errorText);
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app font-display">
            Órdenes de Reparación
          </h1>
          <p className="mt-1 text-sm text-muted">
            Control integral del ciclo de vida y estado de taller para motores mineros.
          </p>
        </div>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <DashboardStats ordenes={ordenes} isLoading={cargando} />

      <CreateOrderForm
        clientes={clientes}
        motores={motores}
        form={form}
        setForm={setForm}
        onCreateOrder={handleCreate}
        isCreating={creando}
        isLoading={cargando}
      />

      <section className="space-y-4 pt-2">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-bold text-app font-display">
              Listado de Órdenes Activas
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Mostrando{" "}
              <span className="font-semibold text-app">
                {ordenesFiltradas.length}
              </span>{" "}
              de {ordenes.length} órdenes registradas
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <label className="relative flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-muted shadow-sm transition focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              <ListFilter size={16} aria-hidden="true" />
              <div className="relative flex-1">
                <select
                  value={filtroEstado}
                  onChange={(event) => setFiltroEstado(event.target.value)}
                  aria-label="Filtrar órdenes por estado"
                  className="w-full appearance-none bg-transparent py-1.5 pr-8 text-xs font-semibold text-app outline-none uppercase tracking-wide cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-200 py-2">Todos los estados</option>
                  {estados.map((estado) => (
                    <option key={estado} value={estado} className="bg-slate-900 text-slate-200 py-2">
                      {estado.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
              </div>
            </label>

            <label className="flex min-h-10 min-w-56 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-muted shadow-sm transition focus-within:ring-1 focus-within:ring-primary focus-within:border-primary sm:w-72">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por Nº orden o falla..."
                aria-label="Buscar por número o descripción"
                className="w-full bg-transparent py-1.5 text-xs text-app outline-none placeholder:text-muted/50"
              />
            </label>
          </div>
        </div>

        <OrdersTable ordenes={ordenesFiltradas} isLoading={cargando} />
      </section>
    </div>
  );
};
