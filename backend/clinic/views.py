from django.contrib.auth import authenticate
from django.db.models import Prefetch
from rest_framework import viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Appointment, Patient
from .serializers import PatientSerializer, PatientWriteSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({'detail': 'Invalid credentials.'}, status=400)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'clinic_name': user.clinic.name if user.clinic else None,
    })


class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Patient.objects.filter(
            clinic=self.request.user.clinic
        ).select_related('clinic').prefetch_related(
            Prefetch('appointments', queryset=Appointment.objects.prefetch_related('clinicians'))
        ).order_by('last_name', 'first_name')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PatientWriteSerializer
        return PatientSerializer

    def perform_create(self, serializer):
        serializer.save(clinic=self.request.user.clinic)

