from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User, Doctor, Patient, Slot, Appointment
from django.utils import timezone
import datetime

class AppointmentTests(APITestCase):
    def setUp(self):
        # Создаем пациента
        self.patient_user = User.objects.create_user(
            username='test_patient', 
            password='password123',
            role='PATIENT'
        )
        self.patient = Patient.objects.create(
            user=self.patient_user,
            insurance_number='1234567890123456'
        )

        # Создаем врача
        self.doctor_user = User.objects.create_user(
            username='test_doctor', 
            password='password123',
            role='DOCTOR'
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization='Терапевт'
        )

        # Создаем доступный слот (на завтра)
        self.slot = Slot.objects.create(
            doctor=self.doctor,
            start_time=timezone.now() + datetime.timedelta(days=1),
            end_time=timezone.now() + datetime.timedelta(days=1, hours=1),
            is_available=True
        )

        self.list_url = reverse('appointment-list')

    def test_create_appointment_success(self):
        """
        Проверка успешного создания записи и автоматического закрытия слота.
        """
        self.client.force_authenticate(user=self.patient_user)
        data = {
            'patient': self.patient.id,
            'slot': self.slot.id,
            'complaint': 'Тестовая жалоба'
        }
        response = self.client.post(self.list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 1)
        
        # Проверяем, что слот стал недоступен
        self.slot.refresh_from_db()
        self.assertFalse(self.slot.is_available)

    def test_appointment_atomicity_on_failure(self):
        """
        Проверка атомарности: если создание записи упало, слот должен остаться открытым.
        """
        self.client.force_authenticate(user=self.patient_user)
        
        # Отправляем некорректные данные (например, несуществующий пациент)
        data = {
            'patient': 9999, # Такого пациента нет
            'slot': self.slot.id,
            'complaint': 'Error test'
        }
        response = self.client.post(self.list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Проверяем, что слот ВСЕ ЕЩЕ доступен (транзакция откатилась)
        self.slot.refresh_from_db()
        self.assertTrue(self.slot.is_available)

    def test_permissions_anonymous(self):
        """
        Анонимный пользователь должен получить 401 Unauthorized.
        """
        response = self.client.post(self.list_url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patient_data_isolation(self):
        """
        Пациент не должен видеть чужие записи (RBAC).
        Примечание: Тест может упасть, если в ViewSet не реализован get_queryset.
        """
        # Создаем другого пациента и его запись
        other_user = User.objects.create_user(username='other', password='pin', role='PATIENT')
        other_patient = Patient.objects.create(user=other_user)
        other_slot = Slot.objects.create(
            doctor=self.doctor, 
            start_time=timezone.now(), 
            end_time=timezone.now(), 
            is_available=False
        )
        Appointment.objects.create(patient=other_patient, slot=other_slot, complaint="Other")

        # Авторизуемся как первый пациент
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get(self.list_url)
        
        # В идеале пациент должен видеть 0 записей, так как его личных еще нет
        self.assertEqual(len(response.data), 0)
