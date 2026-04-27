import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPatient, updatePatient, getPatient } from '../api/patients'
import type { CreatePatientDto } from '../types'
import type { AxiosError } from 'axios'
import Modal from './Modal'
import Spinner from './Spinner'
import { toasts } from '../lib/toast'
import { extractApiError } from '../utils/error'

interface Props {
  patientId?: number
  onClose: () => void
}

export default function PatientModal({ patientId, onClose }: Props) {
  const queryClient = useQueryClient()
  const isEdit = patientId !== undefined

  const { data: existing, isLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId!),
    enabled: isEdit,
  })

  const [edits, setEdits] = useState<Partial<CreatePatientDto>>({})

  const form: CreatePatientDto = {
    first_name: existing?.first_name ?? '',
    last_name: existing?.last_name ?? '',
    date_of_birth: existing?.date_of_birth ?? '',
    ...edits,
  }

  const mutation = useMutation({
    mutationFn: (data: CreatePatientDto) =>
      isEdit ? updatePatient(patientId!, data) : createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      if (isEdit) {
        toasts.patientUpdated()
      } else {
        toasts.patientCreated()
      }
      onClose()
    },
    onError: (error) => {
      const detail = extractApiError(error)
      if (isEdit) {
        toasts.updateError(detail)
      } else {
        toasts.createError(detail)
      }
    },
  })

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!form.first_name || !form.last_name || !form.date_of_birth) return
    mutation.mutate(form)
  }

  return (
    <Modal
      title={isEdit ? 'Edit Patient' : 'New Patient'}
      subtitle={isEdit ? 'Update the patient information below.' : 'Fill in the details to add a new patient.'}
      onClose={onClose}
    >
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                First Name
              </label>
              <input
                value={form.first_name}
                onChange={(e) => setEdits({ ...edits, first_name: e.target.value })}
                placeholder="Jane"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Last Name
              </label>
              <input
                value={form.last_name}
                onChange={(e) => setEdits({ ...edits, last_name: e.target.value })}
                placeholder="Smith"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => setEdits({ ...edits, date_of_birth: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>

          {mutation.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {(mutation.error as AxiosError<Record<string, string[]>>).response?.data
                ? Object.values((mutation.error as AxiosError<Record<string, string[]>>).response!.data!).flat().join(' ')
                : (mutation.error as AxiosError).message}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full sm:flex-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Patient'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
