from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from clinic.models import Clinic, Patient

User = get_user_model()

TEST_USERNAME = 'testuser'
TEST_PASSWORD = 'testpass123'
CLINIC_NAME = 'Riverside Medical Clinic'


class Command(BaseCommand):
    help = 'Seed a test clinic, user, and sample patients'

    def handle(self, *args, **options):
        clinic, created = Clinic.objects.get_or_create(
            name=CLINIC_NAME,
            defaults={'address': '123 Riverside Drive, Springfield'}
        )
        if created:
            self.stdout.write(f'  Created clinic: {clinic.name}')
        else:
            self.stdout.write(f'  Clinic already exists: {clinic.name}')

        user, created = User.objects.get_or_create(username=TEST_USERNAME)
        if created:
            user.set_password(TEST_PASSWORD)
            user.clinic = clinic
            user.save()
            self.stdout.write(f'  Created user: {TEST_USERNAME} / {TEST_PASSWORD}')
        else:
            user.clinic = clinic
            user.save()
            self.stdout.write(f'  User already exists: {TEST_USERNAME} (clinic updated)')

        sample_patients = [
            ('Alice', 'Johnson', '1985-03-14'),
            ('Bob', 'Williams', '1972-07-22'),
            ('Carol', 'Martinez', '1990-11-05'),
            ('David', 'Brown', '1965-01-30'),
            ('Emma', 'Davis', '2001-08-19'),
        ]

        created_count = 0
        for first, last, dob in sample_patients:
            _, created = Patient.objects.get_or_create(
                first_name=first,
                last_name=last,
                clinic=clinic,
                defaults={'date_of_birth': dob}
            )
            if created:
                created_count += 1

        self.stdout.write(f'  Created {created_count} sample patient(s)')
        self.stdout.write(self.style.SUCCESS('\nSeed complete.'))
        self.stdout.write(f'  Login at /login  →  {TEST_USERNAME} / {TEST_PASSWORD}')
