import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleDashboard } from "@/lib/roles";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      navigate(getRoleDashboard(user.role), { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return null;
}
