import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AppShell, ProtectedRoute } from "./components/layout";
import RoleRoute from "./components/layout/RoleRoute";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { getHomeRoute } from "./lib/rbac";
import { ROUTES } from "./types";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import DriversPage from "./pages/DriversPage";
import FleetPage from "./pages/FleetPage";
import FuelExpensesPage from "./pages/FuelExpensesPage";
import LoginPage from "./pages/LoginPage";
import MaintenancePage from "./pages/MaintenancePage";
import TripsPage from "./pages/TripsPage";

function Guarded({ children }: { children: ReactNode }) {
  return <RoleRoute>{children}</RoleRoute>;
}

function DefaultRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? getHomeRoute(user) : ROUTES.login} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route
              path={ROUTES.dashboard}
              element={
                <Guarded>
                  <DashboardPage />
                </Guarded>
              }
            />
            <Route
              path={ROUTES.fleet}
              element={
                <Guarded>
                  <FleetPage />
                </Guarded>
              }
            />
            <Route
              path={ROUTES.drivers}
              element={
                <Guarded>
                  <DriversPage />
                </Guarded>
              }
            />
            <Route
              path={ROUTES.trips}
              element={
                <Guarded>
                  <TripsPage />
                </Guarded>
              }
            />
            <Route
              path={ROUTES.maintenance}
              element={
                <Guarded>
                  <MaintenancePage />
                </Guarded>
              }
            />
            <Route
              path={ROUTES.fuelExpenses}
              element={
                <Guarded>
                  <FuelExpensesPage />
                </Guarded>
              }
            />
            <Route
              path={ROUTES.analytics}
              element={
                <Guarded>
                  <AnalyticsPage />
                </Guarded>
              }
            />
          </Route>
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
