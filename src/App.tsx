import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authService } from "@/services/AuthService";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import QRGenerate from "./pages/QRGenerate";
import Scan from "./pages/Scan";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import LeaveRequest from "./pages/LeaveRequest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const user = authService.getCurrentUser();
  
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/students" element={
            <ProtectedRoute roles={['admin']}>
              <Students />
            </ProtectedRoute>
          } />
          
          <Route path="/qr-generate" element={
            <ProtectedRoute roles={['admin', 'guru']}>
              <QRGenerate />
            </ProtectedRoute>
          } />
          
          <Route path="/scan" element={
            <ProtectedRoute roles={['admin', 'guru']}>
              <Scan />
            </ProtectedRoute>
          } />
          
          <Route path="/attendance" element={
            <ProtectedRoute roles={['admin', 'guru']}>
              <Attendance />
            </ProtectedRoute>
          } />
          
          <Route path="/my-attendance" element={
            <ProtectedRoute roles={['siswa']}>
              <Attendance />
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute roles={['admin']}>
              <Reports />
            </ProtectedRoute>
          } />
          
          <Route path="/leave-request" element={
            <ProtectedRoute>
              <LeaveRequest />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
