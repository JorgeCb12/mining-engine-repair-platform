import {
  useState,
  type Dispatch,
  type FormEventHandler,
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
  onCreateOrder: FormEventHandler<HTMLFormElement>;
  isCreating: boolean;
  isLoading: boolean;
}

const fieldClass = "grid gap-2 text-sm font-medium text-gray-700";
const controlClass =
  "w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60";

const FieldLabel = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => (
  <span className="flex items-center gap-2">
    <span className="text-gray-400" aria-hidden="true">
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
  const isDisabled = isCreating || isLoading;
  const isSubmitDisabled =
    isDisabled || clientes.length === 0 || motores.length === 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Plus size={21} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Crear orden
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Registra una nueva solicitud de reparación.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          aria-controls="create-order-form"
          aria-label={isExpanded ? "Ocultar formulario" : "Mostrar formulario"}
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-blue-600"
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
          onSubmit={onCreateOrder}
          className="grid gap-5 p-5 sm:p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className={fieldClass}>
              <FieldLabel icon={<Building2 size={16} />}>
                Cliente <span className="text-red-500">*</span>
              </FieldLabel>
              <select
                value={form.cliente_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cliente_id: event.target.value,
                  }))
                }
                className={controlClass}
                required
                disabled={isLoading || clientes.length === 0}
              >
                <option value="">
                  {isLoading
                    ? "Cargando clientes..."
                    : clientes.length === 0
                      ? "No hay clientes disponibles"
                      : "Selecciona un cliente"}
                </option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.razon_social}
                  </option>
                ))}
              </select>
            </label>

            <label className={fieldClass}>
              <FieldLabel icon={<Cog size={16} />}>
                Motor <span className="text-red-500">*</span>
              </FieldLabel>
              <select
                value={form.motor_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    motor_id: event.target.value,
                  }))
                }
                className={controlClass}
                required
                disabled={isLoading || motores.length === 0}
              >
                <option value="">
                  {isLoading
                    ? "Cargando motores..."
                    : motores.length === 0
                      ? "No hay motores disponibles"
                      : "Selecciona un motor"}
                </option>
                {motores.map((motor) => (
                  <option key={motor.id} value={motor.id}>
                    {motor.numero_serie} — {motor.fabricante} {motor.modelo}
                  </option>
                ))}
              </select>
            </label>

            <label className={fieldClass}>
              <FieldLabel icon={<FileText size={16} />}>
                Descripción de la falla{" "}
                <span className="text-red-500">*</span>
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
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-gray-500">
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
              <span className="text-xs font-normal text-gray-400">
                Puedes dejar el campo vacío si aún no tienes el costo.
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              <span className="text-red-500">*</span> Campos obligatorios
            </p>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none"
            >
              {isCreating ? (
                <>
                  <LoaderCircle
                    size={17}
                    aria-hidden="true"
                    className="animate-spin"
                  />
                  Creando orden...
                </>
              ) : (
                <>
                  <Plus size={17} aria-hidden="true" />
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
