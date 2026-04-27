from clinic.models import Clinic, User, Patient


def make_clinic(name: str = "Test Clinic", address: str = "1 Main St") -> Clinic:
    return Clinic.objects.create(name=name, address=address)


def make_user(clinic: Clinic, username: str = "testuser", password: str = "testpass123") -> User:
    return User.objects.create_user(username=username, password=password, clinic=clinic)


def make_patient(
    clinic: Clinic, first: str = "John", last: str = "Doe", dob: str = "1990-01-01"
) -> Patient:
    return Patient.objects.create(
        clinic=clinic, first_name=first, last_name=last, date_of_birth=dob
    )
