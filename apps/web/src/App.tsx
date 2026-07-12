import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell, ProtectedRoute } from "./components/layout";
import { AuthProvider } from "./hooks/useAuth";
import { ROUTES } from "./types";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import DriversPage from "./pages/DriversPage";
import FleetPage from "./pages/FleetPage";
import FuelExpensesPage from "./pages/FuelExpensesPage";
import LoginPage from "./pages/LoginPage";
import MaintenancePage from "./pages/MaintenancePage";
import TripsPage from "./pages/TripsPage";

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
            <Route path={ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={ROUTES.fleet} element={<FleetPage />} />
            <Route path={ROUTES.drivers} element={<DriversPage />} />
            <Route path={ROUTES.trips} element={<TripsPage />} />
            <Route path={ROUTES.maintenance} element={<MaintenancePage />} />
            <Route path={ROUTES.fuelExpenses} element={<FuelExpensesPage />} />
            <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
