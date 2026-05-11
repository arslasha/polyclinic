"use client";

import { useState, useEffect } from "react";
import { Appointment } from "@/types";
import { appointmentsApi } from "@/lib/api";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const data = await appointmentsApi.list();
        setAppointments(data);
      } catch (err: any) {
        setError(err.message || "Ошибка при загрузке записей. Возможно, вы не авторизованы.");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  const filtered = appointments.filter(app => filter === 'all' || app.status === filter);

  return (
    <div className="animate-in space-y-12">
      <header>
        <h1 className="text-4xl font-heading font-bold mb-2">Мои записи</h1>
        <p className="text-foreground/60">Управляйте вашими визитами и просматривайте историю назначений.</p>
      </header>

      {loading ? (
        <div className="space-y-4">
           {[1, 2, 3].map(i => <div key={i} className="h-24 glass animate-pulse rounded-2xl" />)}
        </div>
      ) : error ? (
        <div className="p-8 glass rounded-2xl text-accent font-medium text-center">
           {error}
        </div>
      ) : (
        <>
          <div className="flex gap-2 p-1 glass w-fit rounded-xl">
            {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  filter === f ? "bg-primary text-white" : "hover:bg-primary/5 text-foreground/60"
                }`}
              >
                {f === 'all' ? 'Все' : f === 'scheduled' ? 'Будущие' : f === 'completed' ? 'Завершенные' : 'Отмененные'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map((app) => {
              const doctor = app.slot_details?.doctor_details;
              const doctorUser = doctor?.user_details;
              const doctorFullName = `${doctorUser?.last_name || ""} ${doctorUser?.first_name || ""} ${doctorUser?.middle_name || ""}`.trim();
              const startTime = app.slot_details?.start_time;

              return (
                <div key={app.id} className="glass p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all group">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        app.status === 'scheduled' ? 'bg-primary' : app.status === 'completed' ? 'bg-secondary' : 'bg-accent'
                      }`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                        {app.status === 'scheduled' ? 'Запланировано' : app.status === 'completed' ? 'Завершено' : 'Отменено'}
                      </span>
                    </div>
                    <h3 className="text-xl font-heading font-bold group-hover:text-primary transition-colors">{doctorFullName || "Врач"}</h3>
                    <p className="text-sm text-primary font-medium">{doctor?.specialization}</p>
                  </div>

                  <div className="flex flex-col md:items-end gap-1 min-w-[140px]">
                    <div className="text-lg font-bold">
                      {startTime ? new Date(startTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : "—"}
                    </div>
                    <div className="text-sm text-foreground/60">
                      {startTime ? new Date(startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button className="px-4 py-2 glass rounded-lg text-sm font-bold hover:bg-primary/5 transition-all">
                      Подробнее
                    </button>
                    {app.status === 'scheduled' && (
                      <button className="px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm font-bold hover:bg-accent/20 transition-all">
                        Отменить
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-20 text-center glass rounded-2xl border-dashed border-2">
                <p className="text-foreground/40 font-medium">Записей не найдено</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
