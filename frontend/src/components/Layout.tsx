import {
  Activity,
  Cog,
  LayoutDashboard,
  LogOut,
  UsersRound,
  Wrench,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

const links = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", Icon: UsersRound },
  { to: "/motores", label: "Motores", Icon: Wrench },
] as const;

export const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "administrador";
  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/clientes": "Clientes",
    "/motores": "Motores",
    "/usuarios": "Usuarios",
  };
  const currentTitle = location.pathname.startsWith("/ordenes/")
    ? "Detalle de orden"
    : (pageTitles[location.pathname] ?? "Panel");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/dashboard"
            className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Cog size={21} aria-hidden="true" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold tracking-tight text-gray-900">
                MineRepair
              </span>
              <span className="block text-[10px] font-semibold tracking-widest text-gray-400">
                WORKSHOP MANAGEMENT
              </span>
            </span>
          </NavLink>

          <nav
            aria-label="Navegación principal"
            className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto sm:gap-2"
          >
            {links.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/usuarios"
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <UsersRound size={18} aria-hidden="true" />
                <span className="hidden md:inline">Usuarios</span>
                <span className="hidden rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 lg:inline">
                  ADMIN
                </span>
              </NavLink>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-40 truncate text-xs font-semibold text-gray-800">
                {user?.email ?? "Sesión activa"}
              </p>
              <p className="mt-0.5 text-[11px] capitalize text-gray-500">
                {user?.role ?? "Usuario"}
              </p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-20 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-xs text-gray-500">
          <Activity size={14} aria-hidden="true" />
          <span>Operaciones</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-gray-800">{currentTitle}</span>
        </div>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
