from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import User, Doctor, Patient, Slot, Appointment, UserRole

class PatientBookingFlowTestCase(APITestCase):
    """
    Complex integration test for the full patient journey:
    Auth -> Discovery -> Selection -> Booking -> Verification -> Profile
    """
    def setUp(self):
        self.client = APIClient()
        self.password = "strong_password123"
        
        # 1. Create Patient User
        self.user = User.objects.create_user(
            username='integration_patient', 
            password=self.password, 
            role=UserRole.PATIENT,
            first_name="Иван",
            last_name="Иванов"
        )
        self.patient = Patient.objects.create(
            user=self.user,
            insurance_number="11122233344",
            medical_policy="1111222233334444"
        )
        
        # 2. Create Doctor
        self.doctor_user = User.objects.create_user(
            username='integration_doctor', 
            password=self.password, 
            role=UserRole.DOCTOR,
            last_name="Петров"
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Кардиолог"
        )
        
        # 3. Create available slot for tomorrow
        self.slot = Slot.objects.create(
            doctor=self.doctor,
            start_time=timezone.now() + timedelta(days=1, hours=10),
            end_time=timezone.now() + timedelta(days=1, hours=11),
            is_available=True
        )

    def test_full_patient_booking_flow(self):
        # --- PHASE 1: Auth (JWT Obtain) ---
        login_url = reverse('token_obtain_pair')
        login_data = {
            "username": "integration_patient",
            "password": self.password
        }
        response = self.client.post(login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        
        # Set JWT Token for all subsequent requests
        access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # --- PHASE 2: Discovery (Find Doctors) ---
        doctors_url = reverse('doctor-list')
        response = self.client.get(doctors_url, {'specialization': 'Кардиолог'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
        
        # Find our doctor ID
        doctor_id = None
        for doc in response.data:
            if doc['user_details']['last_name'] == "Петров":
                doctor_id = doc['id']
                break
        self.assertIsNotNone(doctor_id)

        # --- PHASE 3: Selection (Find Slots) ---
        slots_url = reverse('slot-list')
        response = self.client.get(slots_url, {
            'doctor_id': doctor_id,
            'is_available': 'true'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
        
        # Select the first available slot
        slot_id = response.data[0]['id']
        self.assertEqual(slot_id, self.slot.id)

        # --- PHASE 4: Action (Book Appointment) ---
        booking_url = reverse('appointment-list')
        booking_data = {
            "patient": self.patient.id,
            "slot": slot_id,
            "complaint": "Плановый осмотр"
        }
        response = self.client.post(booking_url, booking_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        appointment_id = response.data['id']

        # --- PHASE 5: Verification (Backend Consistency) ---
        # 1. Check slot is now CLOSED
        self.slot.refresh_from_db()
        self.assertFalse(self.slot.is_available)
        
        # 2. Check appointment exists in list
        response = self.client.get(booking_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item['id'] == appointment_id for item in response.data))

        # --- PHASE 6: Profile Check (User Me) ---
        me_url = reverse('user-me')
        response = self.client.get(me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'integration_patient')
        
        # Verify appointment history in profile
        patient_profile = response.data.get('patient_profile')
        self.assertIsNotNone(patient_profile)
        self.assertIn(appointment_id, patient_profile['appointments'])
        
        print("\n[SUCCESS] Integration Flow: Auth -> Discovery -> Selection -> Booking -> Verify -> Profile")
