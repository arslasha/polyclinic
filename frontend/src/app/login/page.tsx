"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authApi.login({ username, password });
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-in">
      <div className="glass p-8 rounded-3xl w-full max-w-md space-y-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-primary">Вход в систему</h1>
          <p className="text-foreground/60 mt-2">Введите ваши данные для доступа к порталу</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">Логин</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass border-border focus:border-primary outline-none transition-all"
              placeholder="admin"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass border-border focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-accent text-sm font-medium text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 scale-100 hover:scale-[1.02] active:scale-95"
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/40">
          Нет аккаунта? Обратитесь в регистратуру
        </p>
      </div>
    </div>
  );
}
