import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cog, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { authApi } from "../api/client";
import type { AuthResponse } from "../types";
import { useAuth } from "../hook/useAuth";

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await authApi.post("/auth/register", {
          email,
          password,
          role: "operativo",
        });
      }

      const res = await authApi.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      login(res.data.access_token, res.data.user);
      navigate("/dashboard");
    } catch {
      setError(
        isRegister
          ? "Error al registrar. El usuario ya existe."
          : "Credenciales incorrectas",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 font-sans text-gray-900">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/60 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Cog size={28} aria-hidden="true" />
          </div>
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-blue-600 uppercase">
            MineRepair
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isRegister ? "Crear cuenta" : "Bienvenido de nuevo"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isRegister
              ? "Completa tus datos para comenzar."
              : "Inicia sesión para continuar al panel."}
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2 text-sm font-medium text-gray-700">
            Correo electrónico
            <span className="relative block">
              <Mail
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="nombre@empresa.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pr-3 pl-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </span>
          </label>

          <label className="block space-y-2 text-sm font-medium text-gray-700">
            Contraseña
            <span className="relative block">
              <LockKeyhole
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pr-3 pl-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting && (
              <LoaderCircle
                size={17}
                aria-hidden="true"
                className="animate-spin"
              />
            )}
            {isSubmitting
              ? "Procesando..."
              : isRegister
                ? "Crear cuenta"
                : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-7 border-t border-gray-100 pt-5 text-center">
          <span className="text-sm text-gray-500">
            {isRegister ? "¿Ya tienes una cuenta?" : "¿Aún no tienes cuenta?"}
          </span>{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-sm font-semibold text-blue-600 underline-offset-4 transition hover:text-blue-700 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </button>
        </div>
      </section>
    </main>
  );
};
