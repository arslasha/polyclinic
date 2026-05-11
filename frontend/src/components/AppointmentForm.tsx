"use client";

import { useState, useEffect } from "react";
import { slotsApi, appointmentsApi, patientsApi } from "@/lib/api";
import { Slot, Doctor } from "@/types";

interface AppointmentFormProps {
  doctor: Doctor;
  onSuccess: () => void;
}

export default function AppointmentForm({ doctor, onSuccess }: AppointmentFormProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = doctor.user_details;
  const fullName = `${user?.last_name} ${user?.first_name} ${user?.middle_name || ""}`;

  useEffect(() => {
    async function loadData() {
      try {
        const [slotsData, patientData] = await Promise.all([
          slotsApi.list({ doctor: doctor.id }),
          patientsApi.me()
        ]);
        setSlots(slotsData.filter(s => s.is_available));
        setPatientId(patientData.id);
      } catch (err) {
        console.error("Failed to load appointment data", err);
        setError("Не удалось загрузить данные. Возможно, вы не авторизованы как пациент.");
      }
    }
    loadData();
  }, [doctor.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !patientId) return;

    setLoading(true);
    setError("");
    try {
      await appointmentsApi.create({
        slot: selectedSlot,
        complaint,
        patient: patientId,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Ошибка при записи");
    } finally {
      setLoading(false);
    }
  };


  const groupedSlots = slots.reduce((acc: { [key: string]: Slot[] }, slot) => {
    const date = new Date(slot.start_time).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in">
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
          {user?.last_name?.[0]}{user?.first_name?.[0]}
        </div>
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest">{doctor.specialization}</p>
          <h4 className="text-lg font-heading font-bold">{fullName}</h4>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-bold opacity-60">Выберите время</label>
        <div className="max-h-[280px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {Object.keys(groupedSlots).length > 0 ? (
            Object.entries(groupedSlots).map(([date, dateSlots]) => (
              <div key={date} className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60 border-b border-primary/10 pb-1">{date}</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {dateSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`px-2 py-2 text-xs font-bold rounded-xl border transition-all ${
                        selectedSlot === slot.id
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                          : "bg-white/50 hover:bg-white hover:border-primary/50 hover:text-primary border-border"
                      }`}
                    >
                      {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-foreground/40 text-center py-6">Нет доступных слотов</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2 opacity-60">Комментарий (необязательно)</label>
        <textarea
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Кратко опишите причину визита"
          className="w-full px-4 py-3 rounded-xl glass border-border focus:border-primary outline-none transition-all resize-none h-24 text-sm"
        />
      </div>

      {error && <p className="text-accent text-sm font-medium">{error}</p>}

      <button
        type="submit"
        disabled={!selectedSlot || loading}
        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
      >
        {loading ? "Загрузка..." : "Подтвердить запись"}
      </button>
    </form>

  );
}
