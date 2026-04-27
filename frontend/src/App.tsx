import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PatientList from './components/PatientList'
import Login from './components/Login'

function PrivateRoute({ children }: { children: ReactNode }) {
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '15px',
            borderRadius: '10px',
            padding: '14px 20px',
            maxWidth: '400px',
          },
          success: {
            iconTheme: { primary: '#0284c7', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/patients" element={<PrivateRoute><PatientList /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
