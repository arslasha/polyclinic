"use client";

import { useEffect, useState } from "react";
import DoctorCard from "@/components/DoctorCard";
import AppointmentForm from "@/components/AppointmentForm";
import { Doctor } from "@/types";
import { doctorsApi } from "@/lib/api";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const data = await doctorsApi.list();
        setDoctors(data);
      } catch (err: any) {
        setError(err.message || "Ошибка при загрузке списка врачей");
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);


  return (
    <div className="animate-in">
      <header className="mb-12">
        <h1 className="text-4xl font-heading font-bold mb-2">Наши специалисты</h1>
        <p className="text-foreground/60 max-w-2xl">
          В нашей поликлинике работают только высококвалифицированные врачи с многолетним опытом работы.
          Выберите нужного специалиста и запишитесь на прием.
        </p>
      </header>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 glass rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 glass rounded-2xl text-center text-accent font-medium">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <DoctorCard 
              key={doctor.id} 
              doctor={doctor} 
              onBook={() => setSelectedDoctor(doctor)}
            />
          ))}
          {doctors.length === 0 && (
            <p className="col-span-full text-center text-foreground/40 py-20">Врачи не найдены</p>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/40 backdrop-blur-md"
            onClick={() => setSelectedDoctor(null)}
          />
          <div className="relative w-full max-w-3xl glass p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading font-bold">Запись на прием</h2>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="w-10 h-10 rounded-full hover:bg-foreground/5 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            <AppointmentForm 
              doctor={selectedDoctor} 
              onSuccess={() => {
                setSelectedDoctor(null);
              }} 
            />
          </div>
        </div>
      )}




    </div>
  );
}
