import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPatients, deletePatient } from '../api/patients'
import { getClinicName } from '../api/client'
import { Plus, UserRound } from 'lucide-react'
import Spinner from './Spinner'
import ErrorMessage from './ErrorMessage'
import PatientListItem from './PatientListItem'
import PaginatedTable from './PaginatedTable'
import Navbar from './Navbar'
import PatientModal from './PatientModal'
import { PAGE_SIZE } from '../constants'

const PATIENT_COLUMNS = ['Patient', 'Date of Birth', 'Age', '']

export default function PatientList() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | undefined>(undefined)

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', page],
    queryFn: () => getPatients(page),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      if (data?.results.length === 1 && page > 1) setPage(page - 1)
    },
  })

  const deletingId: number | null = deleteMutation.isPending ? (deleteMutation.variables ?? null) : null

  const openCreate = () => { setEditingId(undefined); setModalOpen(true) }
  const openEdit = (id: number) => { setEditingId(id); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message={(error as Error).message} />

  const { results: patients = [], count: totalCount = 0 } = data ?? {}
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const clinicName = patients[0]?.clinic_name ?? getClinicName() ?? undefined

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar clinicName={clinicName} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {clinicName
                ? `${totalCount} patient${totalCount !== 1 ? 's' : ''} at ${clinicName}`
                : `${totalCount} patient${totalCount !== 1 ? 's' : ''} on record`}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {!patients.length ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <UserRound className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700">No patients yet</p>
                <p className="text-sm text-slate-500 mt-1">Add your first patient to get started.</p>
              </div>
              <button
                onClick={openCreate}
                className="mt-1 text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Add patient →
              </button>
            </div>
          ) : (
            <PaginatedTable
              columns={PATIENT_COLUMNS}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              hasPrev={!!data?.previous}
              hasNext={!!data?.next}
              onPrev={() => setPage(page - 1)}
              onNext={() => setPage(page + 1)}
            >
              {patients.map((patient) => (
                <PatientListItem
                  key={patient.id}
                  patient={patient}
                  isDeleting={deletingId === patient.id}
                  onEdit={() => openEdit(patient.id)}
                  onDelete={() => {
                    if (window.confirm('Delete this patient?')) {
                      deleteMutation.mutate(patient.id)
                    }
                  }}
                />
              ))}
            </PaginatedTable>
          )}
        </div>
      </main>

      {modalOpen && (
        <PatientModal patientId={editingId} onClose={closeModal} />
      )}
    </div>
  )
}
