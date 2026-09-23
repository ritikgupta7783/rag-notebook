import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { Pages } from "@/pages"
import { UI } from "@/components/ui"
import { AuthProvider, useAuth } from "@/context/AuthContext"

function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#121417]">
      <div className="size-8 animate-spin rounded-full border-2 border-[#8ab4f8] border-t-transparent" />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

function GuestOnlyRoute({ children }) {
  const { user, initializing } = useAuth()

  if (initializing) return <FullScreenLoader />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <UI.TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {}
            <Route path="/" element={<Pages.HomePage />} />
            {}
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <Pages.LoginPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestOnlyRoute>
                  <Pages.SignupPage />
                </GuestOnlyRoute>
              }
            />
            {}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Pages.DashboardPage />
                </ProtectedRoute>
              }
            />
            {}
            <Route
              path="/notebook"
              element={
                <ProtectedRoute>
                  <Pages.NotebookPage />
                </ProtectedRoute>
              }
            />
            {}
            <Route path="*" element={<Pages.HomePage />} />
          </Routes>
        </BrowserRouter>
        <UI.Toaster richColors position="top-center" />
      </AuthProvider>
    </UI.TooltipProvider>
  )
}

