import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, UsersRound, Wrench, X } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import logo from "../assets/logo.svg";

const links = [
  { to: "/dashboard", label: "Órdenes de Reparación", Icon: LayoutDashboard },
  { to: "/clientes", label: "Directorio de Clientes", Icon: UsersRound },
  { to: "/motores", label: "Inventario de Motores", Icon: Wrench },
] as const;

export const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === "administrador";
  const pageTitles: Record<string, string> = {
    "/dashboard": "Órdenes de Reparación",
    "/clientes": "Directorio de Clientes",
    "/motores": "Inventario de Motores",
    "/usuarios": "Gestión de Usuarios",
  };
  const currentTitle = location.pathname.startsWith("/ordenes/")
    ? "Detalle de Orden"
    : (pageTitles[location.pathname] ?? "Panel Industrial");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-app font-sans text-app flex">
      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar responsivo */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-col bg-brand-bg/95 lg:bg-brand-bg/60 backdrop-blur-xl bg-gradient-to-b from-white/[0.03] to-transparent text-muted border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full hidden lg:flex"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
          <NavLink
            to="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <img
              src={logo}
              alt="MineRepair Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <span className="block text-sm font-bold tracking-tight text-app">
                MINEREPAIR
              </span>
              <span className="block text-[10px] font-semibold tracking-widest text-primary">
                INDUSTRIAL WORKSHOP
              </span>
            </div>
          </NavLink>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menú"
            className="grid size-9 place-items-center rounded-lg text-muted hover:text-app hover:bg-white/5 lg:hidden"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Navegación principal"
          className="flex-1 space-y-1 px-3 py-6"
        >
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-muted uppercase">
            Módulos Principales
          </div>
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white border-l-2 border-brand-primary shadow-[inset_0_0_20px_rgba(49,233,129,0.1)] font-semibold"
                    : "text-muted hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="pt-6 px-3 pb-2 text-[10px] font-bold tracking-wider text-muted uppercase">
                Administración
              </div>
              <NavLink
                to="/usuarios"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white border-l-2 border-brand-primary shadow-[inset_0_0_20px_rgba(49,233,129,0.1)] font-semibold"
                      : "text-muted hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <UsersRound size={18} aria-hidden="true" />
                <span>Gestión de Usuarios</span>
                <span className="ml-auto rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  ADMIN
                </span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/5 text-xs text-muted">
          <p className="font-semibold text-app">Sistema Minero Pesado</p>
          <p className="mt-0.5">v2.0 · Motor & Engine Repair</p>
        </div>
      </aside>

      {/* Header superior y contenido */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-brand-bg/60 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:text-app hover:bg-white/10 lg:hidden"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            {/* Mobile branding */}
            <div className="flex items-center gap-2 lg:hidden">
              <img
                src={logo}
                alt="MineRepair Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-app tracking-tight">
                MINEREPAIR
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-muted">
              <span>Área de Operaciones</span>
              <span className="text-muted/40" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-app">{currentTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
              <div className="flex flex-col items-end">
                <p className="max-w-44 truncate text-sm font-semibold text-app">
                  {user?.email ?? "Operador"}
                </p>
                <p className="text-xs text-muted capitalize">
                  {user?.role ?? "Industrial"}
                </p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-emerald-700 text-brand-bg font-bold text-lg ring-2 ring-white/10">
                  {user?.email?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-brand-bg rounded-full"></span>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10 mx-2"></div>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-muted hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-all"
            >
              <LogOut size={17} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
