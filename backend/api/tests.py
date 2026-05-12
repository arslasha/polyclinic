from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import User, Doctor, Patient, Slot, Appointment, MedicalRecord, UserRole
from faker import Faker

fake = Faker('ru_RU')

class PolyclinicBaseTestCase(APITestCase):
    def setUp(self):
        # Create Admin
        self.admin_user = User.objects.create_superuser(
            username='admin', password='password123', email='admin@test.com'
        )
        
        # Create Doctor
        self.doctor_user = User.objects.create_user(
            username='doctor_test', password='password123', role=UserRole.DOCTOR
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user, 
            specialization='Терапевт',
            office_number='101'
        )
        
        # Create Patient
        self.patient_user = User.objects.create_user(
            username='patient_test', password='password123', role=UserRole.PATIENT
        )
        self.patient = Patient.objects.create(
            user=self.patient_user,
            insurance_number='12345678901',
            medical_policy='1234567890123456'
        )
        
        # Create Slot
        self.slot = Slot.objects.create(
            doctor=self.doctor,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=1),
            is_available=True
        )

class AuthTests(PolyclinicBaseTestCase):
    def test_login_and_me_endpoints(self):
        # Test Doctor /me/
        self.client.force_authenticate(user=self.doctor_user)
        response = self.client.get(reverse('doctor-me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['specialization'], 'Терапевт')
        
        # Test Patient /me/
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get(reverse('patient-me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['insurance_number'], '12345678901')

    def test_me_not_found(self):
        # User has role DOCTOR but no profile (edge case)
        new_user = User.objects.create_user(username='no_profile', password='password123', role=UserRole.DOCTOR)
        self.client.force_authenticate(user=new_user)
        response = self.client.get(reverse('doctor-me'))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class PatientValidationTests(PolyclinicBaseTestCase):
    def test_invalid_snils_and_policy(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('patient-list')
        
        # Invalid SNILS (short)
        data = {
            "user": self.patient_user.id,
            "insurance_number": "123",
            "medical_policy": "1234567890123456"
        }
        # We need a new user because patient already has one
        new_user = User.objects.create_user(username='p2', password='p')
        data['user'] = new_user.id
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("СНИЛС должен состоять из 11 цифр.", str(response.data))

        # Invalid Policy (long)
        data["insurance_number"] = "12345678901"
        data["medical_policy"] = "123"
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Полис должен состоять из 16 цифр.", str(response.data))

class SlotFilterTests(PolyclinicBaseTestCase):
    def test_filter_by_doctor(self):
        url = reverse('slot-list')
        response = self.client.get(url, {'doctor_id': self.doctor.id})
        self.assertEqual(len(response.data), 1)
        
        response = self.client.get(url, {'doctor_id': 999})
        self.assertEqual(len(response.data), 0)

    def test_filter_by_date(self):
        url = reverse('slot-list')
        date_str = self.slot.start_time.date().isoformat()
        response = self.client.get(url, {'date': date_str})
        self.assertEqual(len(response.data), 1)
        
        response = self.client.get(url, {'date': '2020-01-01'})
        self.assertEqual(len(response.data), 0)

class AppointmentTests(PolyclinicBaseTestCase):
    def test_booking_success_and_slot_closing(self):
        self.client.force_authenticate(user=self.patient_user)
        url = reverse('appointment-list')
        data = {
            "patient": self.patient.id,
            "slot": self.slot.id,
            "complaint": "Головокружение"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify slot is closed
        self.slot.refresh_from_db()
        self.assertFalse(self.slot.is_available)

    def test_double_booking_prevention(self):
        # Book the slot first
        self.slot.is_available = False
        self.slot.save()
        
        self.client.force_authenticate(user=self.patient_user)
        url = reverse('appointment-list')
        data = {
            "patient": self.patient.id,
            "slot": self.slot.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Этот слот уже занят.", str(response.data))

class MedicalRecordRBACTests(PolyclinicBaseTestCase):
    def setUp(self):
        super().setUp()
        # Create appointment and record
        self.appointment = Appointment.objects.create(patient=self.patient, slot=self.slot)
        self.record = MedicalRecord.objects.create(
            patient=self.patient, 
            doctor=self.doctor,
            notes="Пациент здоров"
        )

    def test_patient_access_own_records(self):
        self.client.force_authenticate(user=self.patient_user)
        url = reverse('medicalrecord-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.record.id)

    def test_doctor_access_own_patients_records(self):
        self.client.force_authenticate(user=self.doctor_user)
        url = reverse('medicalrecord-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)
        
    def test_unauthorized_access(self):
        other_patient = User.objects.create_user(username='other', password='p', role=UserRole.PATIENT)
        self.client.force_authenticate(user=other_patient)
        url = reverse('medicalrecord-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 0)

    def test_admin_access_all_records(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('medicalrecord-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)

    def test_unauthenticated_records(self):
        self.client.force_authenticate(user=None)
        url = reverse('medicalrecord-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class AdditionalCoverageTests(PolyclinicBaseTestCase):
    def test_appointment_list_rbac(self):
        # Create an appointment
        Appointment.objects.create(patient=self.patient, slot=self.slot)
        
        # Test Patient sees own
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get(reverse('appointment-list'))
        self.assertEqual(len(response.data), 1)
        
        # Test Doctor sees own patients
        self.client.force_authenticate(user=self.doctor_user)
        response = self.client.get(reverse('appointment-list'))
        self.assertEqual(len(response.data), 1)
        
        # Test Admin sees all
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(reverse('appointment-list'))
        self.assertEqual(len(response.data), 1)

    def test_patient_me_not_found(self):
        user = User.objects.create_user(username='p_no_profile', password='p', role=UserRole.PATIENT)
        self.client.force_authenticate(user=user)
        response = self.client.get(reverse('patient-me'))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_appointments(self):
        self.client.logout()
        response = self.client.get(reverse('appointment-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class ModelStrTests(PolyclinicBaseTestCase):
    def test_str_methods(self):
        self.assertIn(self.doctor_user.last_name, str(self.doctor_user))
        self.assertIn(self.doctor_user.last_name, str(self.doctor))
        self.assertIn(self.patient_user.last_name, str(self.patient))
        self.assertIn(self.doctor_user.last_name, str(self.slot))
        
        appointment = Appointment.objects.create(patient=self.patient, slot=self.slot)
        self.assertIn(self.patient_user.last_name, str(appointment))
        
        record = MedicalRecord.objects.create(patient=self.patient, notes="Test")
        self.assertIn(self.patient_user.last_name, str(record))

class EdgeCaseTests(PolyclinicBaseTestCase):
    def test_empty_doctors_list(self):
        Doctor.objects.all().delete()
        response = self.client.get(reverse('doctor-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_no_slots_on_date(self):
        response = self.client.get(reverse('slot-list'), {'date': '2025-12-31'})
        self.assertEqual(len(response.data), 0)
