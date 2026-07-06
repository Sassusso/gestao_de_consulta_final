import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { PatientDashboard } from '../pages/patient/Dashboard';
import { NewAppointment } from '../pages/patient/NewAppointment';
import { PrivateRoute } from './PrivateRoute';
import { useAuth } from '../hooks/useAuth';
import { Unauthorized } from '../pages/Unauthorized';
import { DoctorDashboard } from '../pages/doctor/Dashboard';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { Notifications } from '../pages/Notifications';
import { Specialties } from '../pages/admin/Specialties';
import { Profile } from '../pages/Profile';
import { AdminUsers } from '../pages/admin/Users';
import { AdminDoctors } from '../pages/admin/Doctors';
import { DoctorPatients } from '@/pages/doctor/Patients';
import { PatientAppointments } from '@/pages/doctor/PatientAppointments';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { Landing } from '@/pages/Landing';

export const AppRoutes = () => {
  const { user } = useAuth();

  const getDashboardByRole = () => {
    switch (user?.role) {
      case 'PATIENT': return <PatientDashboard />;
      case 'DOCTOR': return <DoctorDashboard/>;
      case 'ADMIN': return <AdminDashboard/>;
      default: return <Navigate to="/login" />;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/dashboard"
          element={<PrivateRoute>{getDashboardByRole()}</PrivateRoute>}
        />
        <Route
          path="/doctor/patients"
          element={
            <PrivateRoute roles={['DOCTOR']}>
              <DoctorPatients />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/patient/:patientId/appointments"
          element={
            <PrivateRoute roles={['DOCTOR']}>
              <PatientAppointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/nova-consulta"
          element={
            <PrivateRoute roles={['PATIENT']}>
              <NewAppointment />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminDoctors />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={<PrivateRoute><Notifications /></PrivateRoute>}
        />
        <Route
          path="/admin/specialties"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <Specialties />
            </PrivateRoute>
          }
        />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};