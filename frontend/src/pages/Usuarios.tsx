import { useEffect, useState } from "react";
import { UsersRound, UserX } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../api/client";
import { Modal } from "../components/ui/Modal";
import type { User } from "../types";
import { useAuth } from "../hook/useAuth";

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [userToDeactivate, setUserToDeactivate] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await authApi.get<User[]>("/users");
      setUsuarios(res.data);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!ignore) await fetchUsuarios();
    };
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleDeactivate = (id: string) => {
    setUserToDeactivate(id);
  };

  const confirmDeactivate = async () => {
    if (!userToDeactivate) return;
    try {
      await authApi.patch(`/users/${userToDeactivate}/deactivate`);
      toast.success("Usuario desactivado");
      setUserToDeactivate(null);
      await fetchUsuarios();
    } catch {
      toast.error("Error al desactivar el usuario");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app font-display">
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-sm text-muted">
            Control de cuentas, roles y privilegios de acceso al sistema industrial.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-lg glass-card">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/5 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/5 text-primary font-bold">
              <UsersRound size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-app">
                Directorio de Usuarios del Sistema
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                {usuarios.length}{" "}
                {usuarios.length === 1 ? "usuario registrado" : "usuarios registrados"}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-transparent">
              <tr>
                {[
                  "Usuario",
                  "Rol",
                  "Estado",
                  "Fecha de Registro",
                  "Acciones",
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted uppercase border-b border-white/10"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="bg-transparent">
                    <td className="px-4 py-3"><div className="h-4 w-44 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-24 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-16 bg-white/10 rounded-full animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-white/10 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="mx-auto flex flex-col items-center justify-center">
                      <UsersRound size={48} className="text-muted mb-3" aria-hidden="true" />
                      <p className="text-base font-semibold text-app">No hay usuarios registrados</p>
                      <p className="mt-1 text-xs text-muted">
                        Los usuarios aparecerán aquí al registrarse en la plataforma.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded bg-white/5 text-xs font-bold text-primary border border-white/10">
                          {usuario.email.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-app">
                          {usuario.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-app uppercase tracking-wide">
                        {usuario.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          usuario.isActive
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border border-red-500/30 bg-red-500/10 text-red-300"
                        }`}
                      >
                        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                        {usuario.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted font-medium">
                      {usuario.createdAt
                        ? new Date(usuario.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      {usuario.isActive ? (
                        usuario.id !== currentUser?.id ? (
                          <button
                            onClick={() => handleDeactivate(usuario.id)}
                            className="inline-flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 font-semibold text-red-300 transition hover:bg-red-500/20 cursor-pointer"
                          >
                            <UserX size={14} /> Desactivar
                          </button>
                        ) : (
                          <span className="text-muted text-xs italic">
                            Cuenta actual
                          </span>
                        )
                      ) : (
                        <span className="text-muted font-medium">Desactivado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={userToDeactivate !== null}
        onClose={() => setUserToDeactivate(null)}
        title="Confirmar desactivación"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            ¿Estás seguro de que deseas desactivar esta cuenta? El usuario no podrá volver a iniciar sesión.
          </p>
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setUserToDeactivate(null)}
              className="rounded-lg border border-white/20 bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-app transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-primary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDeactivate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-300 shadow-sm transition hover:bg-red-500/30 focus-visible:outline-2 focus-visible:outline-red-500"
            >
              Sí, desactivar cuenta
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
