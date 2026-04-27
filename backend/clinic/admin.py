from django.contrib import admin
from .models import Clinic, Patient, Clinician, Appointment, AppointmentClinician, User

admin.site.register(Clinic)
admin.site.register(Patient)
admin.site.register(Clinician)
admin.site.register(Appointment)
admin.site.register(AppointmentClinician)
admin.site.register(User)