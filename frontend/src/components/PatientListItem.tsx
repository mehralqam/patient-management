import type { Patient } from '../types'
import { getAge, getInitials } from '../utils/patient'
import { Pencil, Trash2 } from 'lucide-react'

interface Props {
  patient: Patient
  isDeleting: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function PatientListItem({ patient, isDeleting, onEdit, onDelete }: Props) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitials(patient.first_name, patient.last_name)}
          </div>
          <span className="font-medium text-slate-900 text-sm sm:text-base">
            {patient.first_name} {patient.last_name}
          </span>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 tabular-nums text-sm whitespace-nowrap">{patient.date_of_birth}</td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 text-sm whitespace-nowrap">{getAge(patient.date_of_birth)} yrs</td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            disabled={isDeleting}
            title="Edit"
            className="flex items-center gap-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 disabled:opacity-40 disabled:pointer-events-none p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            title="Delete"
            className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:pointer-events-none p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
