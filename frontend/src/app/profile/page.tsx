"use client";

import { useEffect, useState } from "react";
import { patientsApi, doctorsApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<"patient" | "doctor" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Try patient first
        try {
          const patientData = await patientsApi.me();
          setProfile(patientData);
          setUserType("patient");
        } catch (e: any) {
          // If not a patient, try doctor
          if (e.message.includes("404") || e.message.includes("not found")) {
            const doctorData = await doctorsApi.me();
            setProfile(doctorData);
            setUserType("doctor");
          } else {
            throw e;
          }
        }
      } catch (err: any) {
        setError(err.message || "Ошибка при загрузке профиля");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  if (loading) return <div className="animate-pulse glass p-20 rounded-3xl text-center">Загрузка данных...</div>;
  if (error) return <div className="glass p-20 rounded-3xl text-center text-accent font-bold">{error}</div>;

  const user = profile?.user_details;
  const initials = `${user?.last_name?.[0] || ""}${user?.first_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="animate-in space-y-12">
      <header>
        <h1 className="text-4xl font-heading font-bold mb-2">Личный кабинет</h1>
        <p className="text-foreground/60">Ваш персональный профиль в системе «Поликлиника».</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass p-8 rounded-3xl space-y-6">
            <h2 className="text-2xl font-heading font-bold">Персональная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Фамилия", value: user?.last_name },
                { label: "Имя", value: user?.first_name },
                { label: "Отчество", value: user?.middle_name || "—" },
                { label: "Дата рождения", value: user?.birth_date || "Не указана" },
                { label: "Телефон", value: user?.phone || "Не указан" },
                { label: "Email", value: user?.email },
              ].map((field, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{field.label}</label>
                  <p className="text-lg font-medium">{field.value || "—"}</p>
                </div>
              ))}
            </div>
          </section>

          {userType === "patient" ? (
            <section className="glass p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-heading font-bold">Медицинские документы</h2>
              <div className="space-y-4">
                {[
                  { label: "СНИЛС", value: profile?.insurance_number },
                  { label: "Полис ОМС", value: profile?.medical_policy },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">{doc.label}</p>
                      <p className="text-lg font-mono font-bold">{doc.value || "—"}</p>
                    </div>
                    <div className="text-primary text-2xl">📄</div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="glass p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-heading font-bold">Профессиональные данные</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Специализация", value: profile?.specialization },
                  { label: "Стаж", value: `${profile?.experience_years} лет` },
                  { label: "Кабинет", value: profile?.cabinet_number },
                ].map((field, i) => (
                  <div key={i} className="space-y-1">
                    <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{field.label}</label>
                    <p className="text-lg font-medium">{field.value || "—"}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-3xl text-center space-y-4">
             <div className="w-24 h-24 bg-secondary/20 rounded-full mx-auto flex items-center justify-center text-4xl text-secondary font-bold border-4 border-secondary/10">
               {initials}
             </div>
             <div>
               <h3 className="text-xl font-heading font-bold">{user?.first_name} {user?.last_name?.[0]}.</h3>
               <p className="text-sm text-foreground/40 font-medium">{userType === "doctor" ? "Врач" : "Пациент"}</p>
             </div>
             <button 
               onClick={handleLogout}
               className="w-full py-3 glass rounded-xl text-accent font-bold hover:bg-accent/5 transition-all"
             >
               Выйти из системы
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
