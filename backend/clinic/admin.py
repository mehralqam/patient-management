from django.contrib import admin

from .models import Appointment, AppointmentClinician, Clinic, Clinician, Patient, User

admin.site.register(Clinic)
admin.site.register(Patient)
admin.site.register(Clinician)
admin.site.register(Appointment)
admin.site.register(AppointmentClinician)
admin.site.register(User)
