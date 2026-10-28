import { useEffect, useState } from "react";
import { UsersRound, UserX } from "lucide-react";
import { authApi } from "../api/client";
import type { User } from "../types";
import { useAuth } from "../hook/useAuth";

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
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

  const handleDeactivate = async (id: string) => {
    if (!window.confirm("¿Estás seguro de desactivar este usuario?")) return;
    try {
      await authApi.patch(`/users/${id}/deactivate`);
      await fetchUsuarios();
    } catch {
      alert("Error al desactivar el usuario");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 font-sans text-gray-900 sm:px-6 lg:px-8">
      <header>
        <p className="text-xs font-bold tracking-[0.16em] text-blue-600 uppercase">
          Administración
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Usuarios</h1>
        <p className="mt-2 text-sm text-gray-500">
          Consulta las cuentas, roles y estado de acceso.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <UsersRound size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-gray-900">
                Directorio de usuarios
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {usuarios.length}{" "}
                {usuarios.length === 1 ? "usuario" : "usuarios"}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Usuario",
                  "Rol",
                  "Estado",
                  "Fecha de registro",
                  "Acciones",
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {usuario.email.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {usuario.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {usuario.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${usuario.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {usuario.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {usuario.createdAt
                        ? new Date(usuario.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      {usuario.isActive ? (
                        usuario.id !== currentUser?.id ? (
                          <button
                            onClick={() => handleDeactivate(usuario.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-900 font-medium cursor-pointer"
                          >
                            <UserX size={16} /> Desactivar
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            Tu cuenta
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">Desactivado</span>
                      )}
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
