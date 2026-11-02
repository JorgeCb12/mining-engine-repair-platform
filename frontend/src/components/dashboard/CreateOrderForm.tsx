import {
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  Banknote,
  Building2,
  ChevronDown,
  ChevronUp,
  Cog,
  FileText,
  LoaderCircle,
  Plus,
} from "lucide-react";
import type { Cliente, Motor } from "../../types";

export interface OrderFormData {
  motor_id: string;
  cliente_id: string;
  descripcion_falla: string;
  costo_estimado: string;
}

interface CreateOrderFormProps {
  clientes: Cliente[];
  motores: Motor[];
  form: OrderFormData;
  setForm: Dispatch<SetStateAction<OrderFormData>>;
  onCreateOrder: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isCreating: boolean;
  isLoading: boolean;
}

const fieldClass = "grid gap-2 text-xs font-semibold uppercase tracking-wider text-muted";
const controlClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-app outline-none transition placeholder:text-muted/50 focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-60";

const FieldLabel = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => (
  <span className="flex items-center gap-2 text-app">
    <span className="text-muted" aria-hidden="true">
      {icon}
    </span>
    {children}
  </span>
);

export const CreateOrderForm = ({
  clientes,
  motores,
  form,
  setForm,
  onCreateOrder,
  isCreating,
  isLoading,
}: CreateOrderFormProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = isCreating || isSubmitting || isLoading;
  const isSubmitDisabled =
    isDisabled || clientes.length === 0 || motores.length === 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    try {
      await onCreateOrder(event);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg glass-card">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/5 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/5 text-primary font-bold">
            <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-app">
              Registrar Nueva Orden de Reparación
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Asigne un motor y especifique la falla reportada para iniciar el flujo de taller.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          aria-controls="create-order-form"
          aria-label={isExpanded ? "Ocultar formulario" : "Mostrar formulario"}
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/20 bg-transparent text-app transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-primary"
        >
          {isExpanded ? (
            <ChevronUp size={18} aria-hidden="true" />
          ) : (
            <ChevronDown size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      {isExpanded && (
        <form
          id="create-order-form"
          onSubmit={handleSubmit}
          className="grid gap-5 p-5 sm:p-6 bg-transparent"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className={fieldClass}>
              <FieldLabel icon={<Building2 size={16} />}>
                Cliente <span className="text-primary">*</span>
              </FieldLabel>
              <div className="relative">
                <select
                  value={form.cliente_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cliente_id: event.target.value,
                    }))
                  }
                  className={`${controlClass} appearance-none pr-10`}
                  required
                  disabled={isLoading || clientes.length === 0}
                >
                  <option value="" className="bg-slate-900 text-slate-200 py-2">
                    {isLoading
                      ? "Cargando clientes..."
                      : clientes.length === 0
                        ? "No hay clientes disponibles"
                        : "Selecciona un cliente"}
                  </option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id} className="bg-slate-900 text-slate-200 py-2">
                      {cliente.razon_social}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
              </div>
            </label>

            <label className={fieldClass}>
              <FieldLabel icon={<Cog size={16} />}>
                Motor <span className="text-primary">*</span>
              </FieldLabel>
              <div className="relative">
                <select
                  value={form.motor_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      motor_id: event.target.value,
                    }))
                  }
                  className={`${controlClass} appearance-none pr-10`}
                  required
                  disabled={isLoading || motores.length === 0}
                >
                  <option value="" className="bg-slate-900 text-slate-200 py-2">
                    {isLoading
                      ? "Cargando motores..."
                      : motores.length === 0
                        ? "No hay motores disponibles"
                        : "Selecciona un motor"}
                  </option>
                  {motores.map((motor) => (
                    <option key={motor.id} value={motor.id} className="bg-slate-900 text-slate-200 py-2">
                      {motor.numero_serie} — {motor.fabricante} {motor.modelo}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
              </div>
            </label>

            <label className={fieldClass}>
              <FieldLabel icon={<FileText size={16} />}>
                Descripción de la falla{" "}
                <span className="text-primary">*</span>
              </FieldLabel>
              <textarea
                value={form.descripcion_falla}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    descripcion_falla: event.target.value,
                  }))
                }
                placeholder="Describe los síntomas o el problema detectado..."
                className={`${controlClass} min-h-28 resize-y`}
                required
                rows={3}
              />
            </label>

            <label className={fieldClass}>
              <FieldLabel icon={<Banknote size={16} />}>
                Costo estimado
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted">
                  OPCIONAL
                </span>
              </FieldLabel>
              <input
                type="number"
                min="0"
                step="any"
                value={form.costo_estimado}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    costo_estimado: event.target.value,
                  }))
                }
                placeholder="Ej. 1500"
                inputMode="decimal"
                className={controlClass}
              />
              <span className="text-xs font-normal text-muted/60">
                Puedes dejar el campo vacío si aún no tienes el costo.
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-xs text-muted">
              <span className="text-primary">*</span> Campos obligatorios
            </p>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex min-w-44 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-bg shadow-sm transition hover:bg-opacity-90 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-white/5 disabled:text-muted"
            >
              {isSubmitting || isCreating ? (
                <>
                  <LoaderCircle
                    size={16}
                    aria-hidden="true"
                    className="animate-spin"
                  />
                  Registrando...
                </>
              ) : (
                <>
                  <Plus size={16} aria-hidden="true" />
                  Crear orden
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
