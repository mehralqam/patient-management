import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/patients" element={<PrivateRoute><PatientList /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
