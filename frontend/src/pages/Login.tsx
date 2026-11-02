import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { authApi } from "../api/client";
import type { AuthResponse } from "../types";
import { useAuth } from "../hook/useAuth";
import logo from "../assets/logo.svg";

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
      login(res.data.access_token);
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
    <main className="min-h-screen w-full flex items-center justify-center bg-app px-4 py-10 font-sans text-app">
      <section className="w-full max-w-md p-8 sm:p-10 rounded-2xl glass-card relative z-10">
        <div className="text-center mb-8">
          <img src={logo} className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" alt="MineRepair Logo" />
          <h1 className="font-display text-2xl font-bold text-center text-app mb-2">
            {isRegister ? "Crear Cuenta" : "Acceso al Sistema"}
          </h1>
          <p className="text-center text-muted text-sm mb-8">
            Ingresa tus credenciales para continuar.
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="operador@minera.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-app placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-app placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-brand-bg font-bold rounded-lg px-4 py-3 mt-6 hover:opacity-90 transition-all shadow-[0_0_15px_rgba(49,233,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <LoaderCircle
                size={18}
                aria-hidden="true"
                className="animate-spin"
              />
            )}
            {isSubmitting
              ? "Procesando..."
              : isRegister
                ? "Registrarse"
                : "Iniciar Sesión"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
          className="w-full text-center text-sm text-muted mt-6 hover:text-app transition-colors"
        >
          {isRegister
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes una cuenta? Regístrate"}
        </button>
      </section>
    </main>
  );
};
