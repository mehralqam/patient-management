from django.db import models
from django.contrib.auth.models import AbstractUser

class Clinic(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()

    def __str__(self):
        return self.name

class User(AbstractUser):
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

class Patient(models.Model):
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name='patients'
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['clinic', 'last_name'])
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Clinician(models.Model):
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Appointment(models.Model):
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    date = models.DateTimeField()
    clinicians = models.ManyToManyField(
        Clinician,
        through='AppointmentClinician'
    )

    def __str__(self):
        return f"Appointment {self.id} - {self.patient}"


class AppointmentClinician(models.Model):
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE
    )
    clinician = models.ForeignKey(
        Clinician,
        on_delete=models.PROTECT
    )
    role_in_appointment = models.CharField(max_length=100, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['appointment', 'clinician'], name='unique_appointment_clinician')
        ]