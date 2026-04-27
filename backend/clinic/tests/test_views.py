from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from clinic.models import Clinician, Appointment, AppointmentClinician, Patient, User
from .helpers import make_clinic, make_user, make_patient


class AuthenticationTest(APITestCase):
    def setUp(self) -> None:
        self.clinic = make_clinic()
        self.user = make_user(self.clinic)

    def test_unauthenticated_request_is_rejected(self) -> None:
        response = self.client.get("/api/v1/patients/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_request_is_allowed(self) -> None:
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/v1/patients/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_without_clinic_gets_empty_list(self) -> None:
        orphan = User.objects.create_user(username="orphan", password="pass123", clinic=None)
        self.client.force_authenticate(user=orphan)
        response = self.client.get("/api/v1/patients/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])


class PatientCRUDTest(APITestCase):
    def setUp(self) -> None:
        self.clinic = make_clinic()
        self.user = make_user(self.clinic)
        self.patient = make_patient(self.clinic)
        self.client.force_authenticate(user=self.user)

    def test_list_returns_patients_in_own_clinic(self) -> None:
        response = self.client.get("/api/v1/patients/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["first_name"], "John")

    def test_create_patient(self) -> None:
        payload = {"first_name": "Jane", "last_name": "Smith", "date_of_birth": "1985-06-15"}
        response = self.client.post("/api/v1/patients/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Patient.objects.count(), 2)
        self.assertEqual(Patient.objects.get(first_name="Jane").clinic, self.clinic)

    def test_retrieve_patient(self) -> None:
        response = self.client.get(f"/api/v1/patients/{self.patient.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["last_name"], "Doe")

    def test_update_patient(self) -> None:
        payload = {"first_name": "Johnny", "last_name": "Doe", "date_of_birth": "1990-01-01"}
        response = self.client.patch(f"/api/v1/patients/{self.patient.id}/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.patient.refresh_from_db()
        self.assertEqual(self.patient.first_name, "Johnny")

    def test_partial_update_patient(self) -> None:
        response = self.client.patch(
            f"/api/v1/patients/{self.patient.id}/", {"first_name": "Jon"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.patient.refresh_from_db()
        self.assertEqual(self.patient.first_name, "Jon")

    def test_delete_patient(self) -> None:
        response = self.client.delete(f"/api/v1/patients/{self.patient.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Patient.objects.filter(pk=self.patient.id).exists())

    def test_retrieve_patient_includes_nested_appointments(self) -> None:
        clinician = Clinician.objects.create(name="Dr. Lee", role="Specialist")
        appt = Appointment.objects.create(patient=self.patient, date=timezone.now())
        AppointmentClinician.objects.create(appointment=appt, clinician=clinician)

        response = self.client.get(f"/api/v1/patients/{self.patient.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appointments = response.data["appointments"]
        self.assertEqual(len(appointments), 1)
        self.assertEqual(appointments[0]["clinicians"][0]["name"], "Dr. Lee")


class ClinicIsolationTest(APITestCase):
    """Users from Clinic A must never see or modify Clinic B's patients.

    This is the most critical security property of the system.
    """

    def setUp(self) -> None:
        self.clinic_a = make_clinic(name="Clinic A")
        self.clinic_b = make_clinic(name="Clinic B")

        self.user_a = make_user(self.clinic_a, username="user_a")
        self.user_b = make_user(self.clinic_b, username="user_b")

        self.patient_a = make_patient(self.clinic_a, first="Alice", last="A")
        self.patient_b = make_patient(self.clinic_b, first="Bob", last="B")

    def test_list_excludes_other_clinic_patients(self) -> None:
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get("/api/v1/patients/")
        ids = [p["id"] for p in response.data["results"]]
        self.assertIn(self.patient_a.id, ids)
        self.assertNotIn(self.patient_b.id, ids)

    def test_cannot_retrieve_other_clinic_patient(self) -> None:
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(f"/api/v1/patients/{self.patient_b.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_update_other_clinic_patient(self) -> None:
        self.client.force_authenticate(user=self.user_a)
        payload = {
            "first_name": "Hacked",
            "last_name": "B",
            "date_of_birth": "1990-01-01",
            "clinic": self.clinic_b.id,
        }
        response = self.client.put(
            f"/api/v1/patients/{self.patient_b.id}/", payload, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_delete_other_clinic_patient(self) -> None:
        self.client.force_authenticate(user=self.user_a)
        response = self.client.delete(f"/api/v1/patients/{self.patient_b.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Patient.objects.filter(pk=self.patient_b.id).exists())
