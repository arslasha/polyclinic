from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import User, Doctor, Patient, Slot, UserRole
from datetime import timedelta, datetime
import random

class Command(BaseCommand):
    help = 'Seeds the database with high-quality Russian medical data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting database seeding (Russian localization)...')

        # 1. Doctors Data (following requirements)
        doctors_info = [
            ("Иванов", "Иван", "Иванович", "Терапевт", "101", "Опытный терапевт высшей категории."),
            ("Петрова", "Елена", "Сергеевна", "Кардиолог", "205", "Специалист по сердечно-сосудистым заболеваниям."),
            ("Сидоров", "Алексей", "Николаевич", "Невролог", "312", "Лечение заболеваний центральной нервной системы."),
            ("Кузнецова", "Анна", "Михайловна", "Офтальмолог", "404", "Микрохирургия глаза и коррекция зрения."),
            ("Морозов", "Дмитрий", "Павлович", "Хирург", "501", "Общая и абдоминальная хирургия."),
            ("Васильева", "Ольга", "Викторовна", "Педиатр", "105", "Забота о здоровье детей с рождения."),
            ("Смирнов", "Игорь", "Юрьевич", "Стоматолог", "602", "Терапевтическая и эстетическая стоматология."),
        ]

        doctors = []
        for last, first, middle, spec, office, bio in doctors_info:
            # Username and email in Latin
            username = f"{last[0].lower()}{first[0].lower()}_{random.randint(100, 999)}"
            if last == "Иванов": username = "i.ivanov"
            if last == "Петрова": username = "e.petrova"
            if last == "Сидоров": username = "a.sidorov"

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'middle_name': middle,
                    'role': UserRole.DOCTOR,
                    'email': f"{username}@polyclinic.ru",
                    'phone': f"+7 (9{random.randint(10,99)}) {random.randint(100,999)}-{random.randint(10,99)}-{random.randint(10,99)}"
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            
            doctor, _ = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    'specialization': spec,
                    'office_number': office,
                    'bio': bio
                }
            )
            doctors.append(doctor)

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(doctors)} doctors.'))

        # 2. Patients Data
        patients_info = [
            ("Хисамутдинов", "Арслан", "Ильдарович", "patient_arslan", "123-456-789 00", "5432109876543210"),
            ("Кузнецов", "Иван", "Петрович", "patient_ivan", "111-222-333 44", "1111222233334444"),
            ("Смирнова", "Мария", "Александровна", "patient_mary", "555-666-777 88", "5555666677778888"),
        ]

        patients = []
        for last, first, middle, username, snils, policy in patients_info:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'middle_name': middle,
                    'role': UserRole.PATIENT,
                    'email': f"{username}@mail.ru",
                    'birth_date': datetime(random.randint(1970, 2005), random.randint(1, 12), random.randint(1, 28)).date(),
                    'phone': f"+7 (9{random.randint(10,99)}) {random.randint(100,999)}-{random.randint(10,99)}-{random.randint(10,99)}"
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            
            patient, _ = Patient.objects.get_or_create(
                user=user,
                defaults={
                    'insurance_number': snils,
                    'medical_policy': policy,
                    'address': f"г. Москва, ул. Клиническая, д. {random.randint(1, 100)}, кв. {random.randint(1, 200)}"
                }
            )
            patients.append(patient)

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(patients)} patients.'))

        # 3. Slots Generation (Next 14 days)
        self.stdout.write('Generating slots for the next 14 days...')
        now = timezone.now()
        slots_count = 0
        
        for doctor in doctors:
            for day_offset in range(1, 15):
                date = (now + timedelta(days=day_offset))
                if date.weekday() >= 5: continue # Skip weekends (Sat, Sun)
                
                # Morning shift (08:00 - 14:00) or Evening shift (14:00 - 20:00)
                start_hour = 8 if (doctor.id + day_offset) % 2 == 0 else 14
                
                for i in range(12): # 12 slots * 30 min = 6 hours
                    slot_start = date.replace(hour=start_hour, minute=0, second=0, microsecond=0) + timedelta(minutes=i * 30)
                    slot_end = slot_start + timedelta(minutes=30)
                    
                    _, created = Slot.objects.get_or_create(
                        doctor=doctor,
                        start_time=slot_start,
                        end_time=slot_end,
                        defaults={'is_available': True}
                    )
                    if created:
                        slots_count += 1

        self.stdout.write(self.style.SUCCESS(f'Total {slots_count} availability slots generated.'))
        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))
