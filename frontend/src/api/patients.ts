import client from './client';
import type { Patient, CreatePatientDto, PaginatedResponse } from '../types';

export const getPatients = (page = 1) =>
  client.get<PaginatedResponse<Patient>>('patients/', { params: { page } }).then((r) => r.data);

export const getPatient = (id: number) =>
  client.get<Patient>(`patients/${id}/`).then((r) => r.data);

export const createPatient = (data: CreatePatientDto) =>
  client.post<Patient>('patients/', data).then((r) => r.data);

export const updatePatient = (id: number, data: Partial<CreatePatientDto>) =>
  client.patch<Patient>(`patients/${id}/`, data).then((r) => r.data);

export const deletePatient = (id: number) =>
  client.delete(`patients/${id}/`);