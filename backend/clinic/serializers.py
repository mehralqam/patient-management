from rest_framework import serializers

from .models import Appointment, Clinician, Patient


class ClinicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinician
        fields = ['id', 'name', 'role']


class AppointmentSerializer(serializers.ModelSerializer):
    clinicians = ClinicianSerializer(many=True, read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'date', 'clinicians']


class PatientSerializer(serializers.ModelSerializer):
    appointments = AppointmentSerializer(many=True, read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'first_name', 'last_name', 'date_of_birth', 'clinic', 'clinic_name', 'appointments']


class PatientWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['first_name', 'last_name', 'date_of_birth']
