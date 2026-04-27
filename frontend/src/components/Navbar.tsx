import { Users, Building2, LogOut } from 'lucide-react'
import { getClinicName, logout } from '../api/client'

interface Props {
  clinicName?: string
}

export default function Navbar({ clinicName }: Props) {
  const displayName = clinicName ?? getClinicName() ?? undefined

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">Patient Management</span>
        </div>

        <div className="flex items-center gap-4">
          {displayName && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{displayName}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
