from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class UserRole(models.TextChoices):
    PATIENT = 'patient', _('Patient')
    DOCTOR = 'doctor', _('Doctor')
    ADMIN = 'admin', _('Admin')

class AppointmentStatus(models.TextChoices):
    SCHEDULED = 'scheduled', _('Scheduled')
    COMPLETED = 'completed', _('Completed')
    CANCELLED = 'cancelled', _('Cancelled')

class User(AbstractUser):
    """
    Custom user model representing all participants in the system.
    """
    role = models.CharField(
        max_length=10, 
        choices=UserRole.choices, 
        default=UserRole.PATIENT,
        verbose_name=_('Role')
    )
    middle_name = models.CharField(max_length=150, blank=True, null=True, verbose_name=_('Middle Name'))
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Phone'))
    birth_date = models.DateField(blank=True, null=True, verbose_name=_('Birth Date'))
    gender = models.CharField(max_length=10, blank=True, null=True, verbose_name=_('Gender'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.last_name} {self.first_name} ({self.get_role_display()})"

class Doctor(models.Model):
    """
    Profile for doctors, extending the base User model.
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='doctor_profile',
        verbose_name=_('User')
    )
    specialization = models.CharField(max_length=255, verbose_name=_('Specialization'))
    office_number = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Office Number'))
    bio = models.TextField(blank=True, null=True, verbose_name=_('Biography'))

    class Meta:
        verbose_name = _('Doctor')
        verbose_name_plural = _('Doctors')

    def __str__(self) -> str:
        return f"Dr. {self.user.last_name} - {self.specialization}"

class Patient(models.Model):
    """
    Profile for patients, extending the base User model.
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='patient_profile',
        verbose_name=_('User')
    )
    insurance_number = models.CharField(
        max_length=20, 
        unique=True, 
        null=True, 
        blank=True, 
        verbose_name=_('SNILS')
    )
    medical_policy = models.CharField(
        max_length=50, 
        unique=True, 
        null=True, 
        blank=True, 
        verbose_name=_('Medical Policy')
    )
    address = models.TextField(blank=True, null=True, verbose_name=_('Address'))

    class Meta:
        verbose_name = _('Patient')
        verbose_name_plural = _('Patients')

    def __str__(self) -> str:
        return f"Patient: {self.user.last_name} {self.user.first_name}"

class Slot(models.Model):
    """
    Time slots available for booking.
    """
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.CASCADE, 
        related_name='slots',
        verbose_name=_('Doctor')
    )
    start_time = models.DateTimeField(verbose_name=_('Start Time'))
    end_time = models.DateTimeField(verbose_name=_('End Time'))
    is_available = models.BooleanField(default=True, verbose_name=_('Is Available'))

    class Meta:
        verbose_name = _('Slot')
        verbose_name_plural = _('Slots')
        indexes = [
            models.Index(fields=['doctor', 'start_time']),
        ]
        ordering = ['start_time']

    def __str__(self) -> str:
        return f"{self.doctor.user.last_name} slot: {self.start_time.strftime('%Y-%m-%d %H:%M')}"

class Appointment(models.Model):
    """
    Appointments booked by patients for specific slots.
    """
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='appointments',
        verbose_name=_('Patient')
    )
    slot = models.OneToOneField(
        Slot, 
        on_delete=models.CASCADE, 
        related_name='appointment',
        verbose_name=_('Slot')
    )
    status = models.CharField(
        max_length=20, 
        choices=AppointmentStatus.choices, 
        default=AppointmentStatus.SCHEDULED,
        verbose_name=_('Status')
    )
    complaint = models.TextField(blank=True, null=True, verbose_name=_('Complaint'))
    diagnosis_mkb10 = models.CharField(max_length=10, blank=True, null=True, verbose_name=_('MKB-10 Diagnosis'))
    treatment_plan = models.TextField(blank=True, null=True, verbose_name=_('Treatment Plan'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        verbose_name = _('Appointment')
        verbose_name_plural = _('Appointments')
        ordering = ['-slot__start_time']

    def __str__(self) -> str:
        return f"Appointment: {self.patient.user.last_name} with {self.slot.doctor.user.last_name}"

class MedicalRecord(models.Model):
    """
    Historical medical records for patients.
    """
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='medical_records',
        verbose_name=_('Patient')
    )
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_records',
        verbose_name=_('Doctor')
    )
    appointment = models.OneToOneField(
        Appointment, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='medical_record',
        verbose_name=_('Appointment')
    )
    record_date = models.DateTimeField(auto_now_add=True, verbose_name=_('Record Date'))
    notes = models.TextField(verbose_name=_('Notes'))

    class Meta:
        verbose_name = _('Medical Record')
        verbose_name_plural = _('Medical Records')
        ordering = ['-record_date']

    def __str__(self) -> str:
        return f"Medical Record for {self.patient.user.last_name} ({self.record_date.date()})"
