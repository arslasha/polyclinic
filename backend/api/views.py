from django.db import transaction
from rest_framework import viewsets, permissions
from .models import User, Doctor, Patient, Slot, Appointment, MedicalRecord
from .serializers import (
    UserSerializer, DoctorSerializer, PatientSerializer, 
    SlotSerializer, AppointmentSerializer, MedicalRecordSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing user instances.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class DoctorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing doctor profiles.
    """
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing patient profiles.
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

class SlotViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing availability slots.
    """
    queryset = Slot.objects.all()
    serializer_class = SlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing appointments.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Create appointment and mark the slot as unavailable.
        """
        with transaction.atomic():
            appointment = serializer.save()
            slot = appointment.slot
            slot.is_available = False
            slot.save()

class MedicalRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing medical records.
    """
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
