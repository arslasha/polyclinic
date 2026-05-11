import { Doctor } from "@/types";
import Image from "next/image";

interface DoctorCardProps {
  doctor: Doctor;
  onBook?: () => void;
}

export default function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  const user = doctor.user_details;
  const firstName = user?.first_name || "Врач";
  const lastName = user?.last_name || "";
  const middleName = user?.middle_name || "";
  const fullName = `${lastName} ${firstName} ${middleName}`.trim();
  
  return (
    <div className="glass rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      <div className="aspect-square relative bg-secondary/10 overflow-hidden shrink-0">
        {/* Placeholder for doctor image */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-secondary/30 group-hover:scale-110 transition-transform duration-500">
          {lastName[0] || "?"}{firstName[0] || "?"}
        </div>
      </div>

      
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
          {doctor.specialization}
        </div>
        <h3 className="text-lg font-heading font-bold mb-2 group-hover:text-primary transition-colors">
          {fullName}
        </h3>
        <p className="text-sm text-foreground/60 line-clamp-3 mb-4">
          {doctor.bio || "Опытный специалист, готовый помочь вам в решении медицинских вопросов."}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <div className="text-xs text-foreground/40 font-medium">
            Кабинет: {doctor.office_number || "—"}
          </div>
          <button 
            onClick={onBook}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm active:scale-95"
          >
            Записаться
          </button>
        </div>
      </div>
    </div>
  );
}
