import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { canAccessRoute, getHomeRoute } from "../../lib/rbac";
import { Spinner } from "../ui";

type RoleRouteProps = {
  children: ReactNode;
};

/** Blocks deep-links to pages outside the signed-in user's role scope. */
export default function RoleRoute({ children }: RoleRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-layout">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!canAccessRoute(user, location.pathname)) {
    return <Navigate to={getHomeRoute(user)} replace />;
  }

  return children;
}
