from rest_framework import serializers
from .models import User, Doctor, Patient, Slot, Appointment, MedicalRecord

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the Custom User model.
    """
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 
            'last_name', 'middle_name', 'role', 
            'phone', 'birth_date', 'gender', 'created_at'
        )
        read_only_fields = ('id', 'created_at')

class DoctorSerializer(serializers.ModelSerializer):
    """
    Serializer for the Doctor profile.
    """
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Doctor
        fields = ('id', 'user', 'user_details', 'specialization', 'office_number', 'bio')

class PatientSerializer(serializers.ModelSerializer):
    """
    Serializer for the Patient profile.
    """
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Patient
        fields = ('id', 'user', 'user_details', 'insurance_number', 'medical_policy', 'address')

class SlotSerializer(serializers.ModelSerializer):
    """
    Serializer for doctor availability slots.
    """
    doctor_details = DoctorSerializer(source='doctor', read_only=True)
    
    class Meta:
        model = Slot
        fields = ('id', 'doctor', 'doctor_details', 'start_time', 'end_time', 'is_available')

class AppointmentSerializer(serializers.ModelSerializer):
    """
    Serializer for appointments.
    """
    patient_details = PatientSerializer(source='patient', read_only=True)
    slot_details = SlotSerializer(source='slot', read_only=True)
    
    class Meta:
        model = Appointment
        fields = (
            'id', 'patient', 'patient_details', 
            'slot', 'slot_details', 'status', 
            'complaint', 'diagnosis_mkb10', 
            'treatment_plan', 'created_at'
        )
        read_only_fields = ('id', 'created_at')

class MedicalRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for medical records.
    """
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = (
            'id', 'patient', 'patient_details', 
            'doctor', 'doctor_details', 'appointment', 
            'record_date', 'notes'
        )
        read_only_fields = ('id', 'record_date')
