from django.db import transaction
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Doctor, Patient, Slot, Appointment, MedicalRecord, UserRole
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

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
            serializer = self.get_serializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({"detail": "Doctor profile not found."}, status=404)

class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing patient profiles.
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
            serializer = self.get_serializer(patient)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response({"detail": "Patient profile not found."}, status=404)

class SlotViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing availability slots.
    """
    queryset = Slot.objects.all()
    serializer_class = SlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Slot.objects.all()
        doctor_id = self.request.query_params.get('doctor_id')
        date = self.request.query_params.get('date')

        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        
        if date:
            queryset = queryset.filter(start_time__date=date)
            
        return queryset

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing appointments.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Appointment.objects.none()
        
        if user.is_staff or user.role == UserRole.ADMIN:
            return Appointment.objects.all()
        
        if user.role == UserRole.DOCTOR:
            return Appointment.objects.filter(slot__doctor__user=user)
        
        if user.role == UserRole.PATIENT:
            return Appointment.objects.filter(patient__user=user)
            
        return Appointment.objects.none()

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

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return MedicalRecord.objects.none()

        if user.is_staff or user.role == UserRole.ADMIN:
            return MedicalRecord.objects.all()

        if user.role == UserRole.DOCTOR:
            return MedicalRecord.objects.filter(doctor__user=user)

        if user.role == UserRole.PATIENT:
            return MedicalRecord.objects.filter(patient__user=user)

        return MedicalRecord.objects.none()
