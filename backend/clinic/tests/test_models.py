from django.test import TestCase
from django.db import IntegrityError
from django.utils import timezone

from clinic.models import Clinic, User, Patient, Clinician, Appointment, AppointmentClinician
from .helpers import make_clinic, make_user, make_patient


class PatientModelTest(TestCase):
    def setUp(self) -> None:
        self.clinic = make_clinic()
        self.patient = make_patient(self.clinic)

    def test_patient_belongs_to_clinic(self) -> None:
        self.assertEqual(self.patient.clinic, self.clinic)

    def test_patient_str(self) -> None:
        self.assertEqual(str(self.patient), "John Doe")

    def test_created_at_is_set_automatically(self) -> None:
        self.assertIsNotNone(self.patient.created_at)

    def test_deleting_clinic_cascades_to_patients(self) -> None:
        clinic_id = self.clinic.id
        self.clinic.delete()
        self.assertFalse(Patient.objects.filter(clinic_id=clinic_id).exists())


class UserModelTest(TestCase):
    def setUp(self) -> None:
        self.clinic = make_clinic()

    def test_user_scoped_to_clinic(self) -> None:
        user = make_user(self.clinic)
        self.assertEqual(user.clinic, self.clinic)

    def test_user_clinic_nullable(self) -> None:
        user = User.objects.create_user(username="noClinic", password="pass123", clinic=None)
        self.assertIsNone(user.clinic)


class AppointmentClinicianModelTest(TestCase):
    def setUp(self) -> None:
        clinic = make_clinic()
        patient = make_patient(clinic)
        self.clinician = Clinician.objects.create(name="Dr. Smith", role="GP")
        self.appointment = Appointment.objects.create(patient=patient, date=timezone.now())

    def test_unique_constraint_prevents_duplicate_assignment(self) -> None:
        AppointmentClinician.objects.create(
            appointment=self.appointment, clinician=self.clinician
        )
        with self.assertRaises(IntegrityError):
            AppointmentClinician.objects.create(
                appointment=self.appointment, clinician=self.clinician
            )

    def test_deleting_appointment_does_not_delete_clinician(self) -> None:
        AppointmentClinician.objects.create(
            appointment=self.appointment, clinician=self.clinician
        )
        self.appointment.delete()
        self.assertTrue(Clinician.objects.filter(pk=self.clinician.pk).exists())
