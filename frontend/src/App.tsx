import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'

// Layouts
import { AdminLayout } from '@/layouts/AdminLayout'
import { StaffLayout } from '@/layouts/StaffLayout'
import { MobileAdminLayout } from '@/layouts/MobileAdminLayout'

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage'

// Admin Web Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { LeadManagement } from '@/pages/admin/LeadManagement'
import { EmployeeManagement } from '@/pages/admin/EmployeeManagement'
import { LeadDistribution } from '@/pages/admin/LeadDistribution'
import { CallManagement } from '@/pages/admin/CallManagement'
import { FollowUpManagement } from '@/pages/admin/FollowUpManagement'
import { DocumentManagement } from '@/pages/admin/DocumentManagement'
import { BankManagement } from '@/pages/admin/BankManagement'
import { LoanSchemeManagement } from '@/pages/admin/LoanSchemeManagement'
import { LoanApplicationManagement } from '@/pages/admin/LoanApplicationManagement'
import { ReportsPage } from '@/pages/admin/ReportsPage'

// Staff Call Centre Pages
import { StaffDashboard } from '@/pages/staff/StaffDashboard'
import { StaffMyLeads } from '@/pages/staff/StaffMyLeads'
import { StaffCalls } from '@/pages/staff/StaffCalls'
import { StaffFollowUps } from '@/pages/staff/StaffFollowUps'
import { StaffDocuments } from '@/pages/staff/StaffDocuments'
import { StaffLoanTracking } from '@/pages/staff/StaffLoanTracking'
import { StaffPerformance } from '@/pages/staff/StaffPerformance'

// Mobile Admin Pages
import { MobileDashboard } from '@/pages/mobile/MobileDashboard'
import { MobileLeads } from '@/pages/mobile/MobileLeads'
import { MobileEmployees } from '@/pages/mobile/MobileEmployees'
import { MobileDistribution } from '@/pages/mobile/MobileDistribution'
import { MobileCalls } from '@/pages/mobile/MobileCalls'
import { MobileFollowUps } from '@/pages/mobile/MobileFollowUps'
import { MobileDocuments } from '@/pages/mobile/MobileDocuments'
import { MobileBanks } from '@/pages/mobile/MobileBanks'
import { MobileSchemes } from '@/pages/mobile/MobileSchemes'
import { MobileApplications } from '@/pages/mobile/MobileApplications'
import { MobileReports } from '@/pages/mobile/MobileReports'

// Root redirect based on role
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return user?.role === 'admin' ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/staff" replace />
  )
}

function App() {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Web Portal */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="leads" element={<LeadManagement />} />
                <Route path="employees" element={<EmployeeManagement />} />
                <Route path="distribution" element={<LeadDistribution />} />
                <Route path="calls" element={<CallManagement />} />
                <Route path="followups" element={<FollowUpManagement />} />
                <Route path="documents" element={<DocumentManagement />} />
                <Route path="banks" element={<BankManagement />} />
                <Route path="schemes" element={<LoanSchemeManagement />} />
                <Route path="applications" element={<LoanApplicationManagement />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Staff / Call Centre Portal */}
      <Route
        path="/staff/*"
        element={
          <ProtectedRoute requiredRole="staff">
            <StaffLayout>
              <Routes>
                <Route index element={<StaffDashboard />} />
                <Route path="leads" element={<StaffMyLeads />} />
                <Route path="calls" element={<StaffCalls />} />
                <Route path="followups" element={<StaffFollowUps />} />
                <Route path="documents" element={<StaffDocuments />} />
                <Route path="loans" element={<StaffLoanTracking />} />
                <Route path="performance" element={<StaffPerformance />} />
                <Route path="*" element={<Navigate to="/staff" replace />} />
              </Routes>
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      {/* Dedicated Mobile Admin Portal */}
      <Route
        path="/admin-mobile/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <MobileAdminLayout>
              <Routes>
                <Route index element={<MobileDashboard />} />
                <Route path="leads" element={<MobileLeads />} />
                <Route path="employees" element={<MobileEmployees />} />
                <Route path="distribution" element={<MobileDistribution />} />
                <Route path="calls" element={<MobileCalls />} />
                <Route path="followups" element={<MobileFollowUps />} />
                <Route path="documents" element={<MobileDocuments />} />
                <Route path="banks" element={<MobileBanks />} />
                <Route path="schemes" element={<MobileSchemes />} />
                <Route path="applications" element={<MobileApplications />} />
                <Route path="reports" element={<MobileReports />} />
                <Route path="*" element={<Navigate to="/admin-mobile" replace />} />
              </Routes>
            </MobileAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Root & Catch-all Fallbacks */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
