import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout, PublicLayout, homeFor } from './components/Layout'
import { useSchool, useStore } from './data/store'
import { JourneyHome, StepPage } from './pages/Journey'
import { Pipeline, Today } from './pages/Work'
import { EmployerDetail } from './pages/EmployerDetail'
import { Dashboard, District } from './pages/Reports'
import { EmployerView, StudentForm } from './pages/Public'
import { Resources } from './pages/Resources'
import { Intake } from './pages/Intake'

function Home() {
  const { state } = useStore()
  const school = useSchool()
  return <Navigate to={homeFor(state.role, school.slug)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<AppLayout />}>
        <Route path="/intake" element={<Intake />} />
        <Route path="/journey" element={<JourneyHome />} />
        <Route path="/journey/:stepId" element={<StepPage />} />
        <Route path="/today" element={<Today />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/employers/:id" element={<EmployerDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resources" element={<Resources />} />
      </Route>
      <Route element={<PublicLayout />}>
        <Route path="/e/:token" element={<EmployerView />} />
        <Route path="/s/:slug" element={<StudentForm />} />
        <Route path="/district" element={<District />} />
      </Route>
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
