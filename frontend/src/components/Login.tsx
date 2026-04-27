import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import client from '../api/client'
import { toasts } from '../lib/toast'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('testuser')
  const [password, setPassword] = useState('testpass123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('just_logged_out')) {
      sessionStorage.removeItem('just_logged_out')
      toasts.logoutSuccess()
    }
  }, [])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await client.post<{ token: string; clinic_name: string | null }>('auth/login/', { username, password })
      localStorage.setItem('token', res.data.token)
      if (res.data.clinic_name) localStorage.setItem('clinic_name', res.data.clinic_name)
      toasts.loginSuccess()
      navigate('/patients')
    } catch {
      setError('Invalid username or password')
      toasts.loginError()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">Patient Management</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
            <p className="text-sm text-slate-500 mt-1">Access your clinic's patient records</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors mt-1"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  )
}
