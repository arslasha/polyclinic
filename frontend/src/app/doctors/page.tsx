import DoctorCard from "@/components/DoctorCard";
import { Doctor } from "@/types";

// Mock data for initial presentation
const mockDoctors: Doctor[] = [
  {
    id: 1,
    user: {
      id: 1,
      username: "ivanov",
      email: "ivanov@example.com",
      first_name: "Иван",
      last_name: "Иванов",
      middle_name: "Иванович",
      role: "doctor",
    },
    specialization: "Терапевт",
    office_number: "101",
    bio: "Врач высшей категории с 15-летним стажем. Специализируется на комплексной диагностике.",
  },
  {
    id: 2,
    user: {
      id: 2,
      username: "petrova",
      email: "petrova@example.com",
      first_name: "Анна",
      last_name: "Петрова",
      middle_name: "Сергеевна",
      role: "doctor",
    },
    specialization: "Кардиолог",
    office_number: "205",
    bio: "Эксперт в области сердечно-сосудистых заболеваний. Занимается лечением гипертонии и аритмии.",
  },
  {
    id: 3,
    user: {
      id: 3,
      username: "sidorov",
      email: "sidorov@example.com",
      first_name: "Дмитрий",
      last_name: "Сидоров",
      middle_name: "Александрович",
      role: "doctor",
    },
    specialization: "Невролог",
    office_number: "302",
    bio: "Специалист по заболеваниям центральной и периферической нервной системы.",
  },
];

export default function DoctorsPage() {
  return (
    <div className="animate-in">
      <header className="mb-12">
        <h1 className="text-4xl font-heading font-bold mb-2">Наши специалисты</h1>
        <p className="text-foreground/60 max-w-2xl">
          В нашей поликлинике работают только высококвалифицированные врачи с многолетним опытом работы.
          Выберите нужного специалиста и запишитесь на прием.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}
