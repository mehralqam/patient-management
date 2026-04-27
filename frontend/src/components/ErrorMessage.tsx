import { AlertCircle } from 'lucide-react'

interface Props {
  message: string
}

export default function ErrorMessage({ message }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex items-start gap-3 bg-white border border-red-200 rounded-xl px-5 py-4 shadow-sm max-w-md">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-slate-800 text-sm">Something went wrong</p>
          <p className="text-sm text-slate-500 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  )
}
