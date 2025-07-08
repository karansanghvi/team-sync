import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import UserInviteAccept from './pages/invites/UserInviteAccept'
import ManagerDashboard from './pages/manager/ManagerDashboard'

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Home Page Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invite/:invitationId" element={<UserInviteAccept/>}/>
          <Route path="/manager-dashboard" element={<ManagerDashboard/>}/>
        </Routes>
      </Router>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  )
}

export default App