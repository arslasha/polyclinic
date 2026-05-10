from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import User, Doctor, Patient, Slot, UserRole
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seeds the database with initial medical data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Create Doctors
        doctors_data = [
            {
                'username': 'dr_ivanov',
                'first_name': 'Иван',
                'last_name': 'Иванов',
                'middle_name': 'Иванович',
                'specialization': 'Терапевт',
                'office_number': '101',
                'bio': 'Опытный терапевт, стаж 15 лет.'
            },
            {
                'username': 'dr_petrova',
                'first_name': 'Елена',
                'last_name': 'Петрова',
                'middle_name': 'Сергеевна',
                'specialization': 'Кардиолог',
                'office_number': '205',
                'bio': 'Специалист по сердечно-сосудистым заболеваниям.'
            },
            {
                'username': 'dr_sidorov',
                'first_name': 'Алексей',
                'last_name': 'Сидоров',
                'middle_name': 'Николаевич',
                'specialization': 'Невролог',
                'office_number': '312',
                'bio': 'Лечение заболеваний нервной системы.'
            },
        ]

        doctors = []
        for d in doctors_data:
            user, created = User.objects.get_or_create(
                username=d['username'],
                defaults={
                    'first_name': d['first_name'],
                    'last_name': d['last_name'],
                    'middle_name': d['middle_name'],
                    'role': UserRole.DOCTOR,
                    'email': f"{d['username']}@example.com"
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            
            doctor, _ = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    'specialization': d['specialization'],
                    'office_number': d['office_number'],
                    'bio': d['bio']
                }
            )
            doctors.append(doctor)

        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(doctors)} doctors'))

        # 2. Create Patients
        patients_data = [
            {
                'username': 'patient_john',
                'first_name': 'John',
                'last_name': 'Doe',
                'insurance_number': '123-456-789 01',
                'medical_policy': '9876543210123456'
            },
            {
                'username': 'patient_mary',
                'first_name': 'Mary',
                'last_name': 'Smith',
                'insurance_number': '321-654-987 02',
                'medical_policy': '1111222233334444'
            }
        ]

        patients = []
        for p in patients_data:
            user, created = User.objects.get_or_create(
                username=p['username'],
                defaults={
                    'first_name': p['first_name'],
                    'last_name': p['last_name'],
                    'role': UserRole.PATIENT,
                    'email': f"{p['username']}@example.com"
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            
            patient, _ = Patient.objects.get_or_create(
                user=user,
                defaults={
                    'insurance_number': p['insurance_number'],
                    'medical_policy': p['medical_policy'],
                    'address': 'ул. Примерная, д. 1, кв. 1'
                }
            )
            patients.append(patient)

        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(patients)} patients'))

        # 3. Create Slots
        # Start from tomorrow 09:00
        base_date = (timezone.now() + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
        
        slots_count = 0
        for doctor in doctors:
            for day_offset in range(3): # Next 3 days
                day_start = base_date + timedelta(days=day_offset)
                for slot_offset in range(8): # 8 slots per day (4 hours total)
                    start_time = day_start + timedelta(minutes=slot_offset * 30)
                    end_time = start_time + timedelta(minutes=30)
                    
                    _, created = Slot.objects.get_or_create(
                        doctor=doctor,
                        start_time=start_time,
                        end_time=end_time,
                        defaults={'is_available': True}
                    )
                    if created:
                        slots_count += 1

        self.stdout.write(self.style.SUCCESS(f'Created {slots_count} new availability slots'))
        self.stdout.write(self.style.SUCCESS('Seeding completed successfully!'))
