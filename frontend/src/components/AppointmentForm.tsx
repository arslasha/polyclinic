"use client";

import { useState, useEffect } from "react";
import { slotsApi, appointmentsApi } from "@/lib/api";
import { Slot } from "@/types";

interface AppointmentFormProps {
  doctorId: number;
  onSuccess: () => void;
}

export default function AppointmentForm({ doctorId, onSuccess }: AppointmentFormProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSlots() {
      try {
        const data = await slotsApi.list({ doctor: doctorId });
        setSlots(data.filter(s => s.is_available));
      } catch (err) {
        console.error("Failed to load slots", err);
      }
    }
    loadSlots();
  }, [doctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);
    setError("");
    try {
      await appointmentsApi.create({
        slot_id: selectedSlot,
        complaint,
        patient_id: 1, // Mock patient ID
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Ошибка при записи");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in">
      <div>
        <label className="block text-sm font-bold mb-2">Выберите время</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {slots.length > 0 ? (
            slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedSlot(slot.id)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  selectedSlot === slot.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white hover:border-primary/50 border-border"
                }`}
              >
                {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))
          ) : (
            <p className="text-sm text-foreground/40 col-span-full">Нет доступных слотов</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">Что вас беспокоит?</label>
        <textarea
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Кратко опишите причину визита"
          className="w-full px-4 py-3 rounded-xl glass border-border focus:border-primary outline-none transition-all resize-none h-32"
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
