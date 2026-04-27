from django.test import TestCase

from clinic.serializers import PatientSerializer, PatientWriteSerializer

from .helpers import make_clinic, make_patient


class PatientSerializerTest(TestCase):
    def setUp(self) -> None:
        self.clinic = make_clinic()
        self.patient = make_patient(self.clinic)

    def test_read_serializer_includes_appointments_field(self) -> None:
        serializer = PatientSerializer(self.patient)
        self.assertIn("appointments", serializer.data)

    def test_read_serializer_includes_clinic_field(self) -> None:
        serializer = PatientSerializer(self.patient)
        self.assertIn("clinic", serializer.data)

    def test_write_serializer_fields(self) -> None:
        expected = {"first_name", "last_name", "date_of_birth"}
        self.assertEqual(set(PatientWriteSerializer().fields.keys()), expected)

    def test_write_serializer_does_not_expose_appointments(self) -> None:
        self.assertNotIn("appointments", PatientWriteSerializer().fields)
