import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "ADMIN";
}) {
  const [status, setStatus] = useState<
    "loading" | "auth" | "guest" | "forbidden"
  >("loading");

  useEffect(() => {
    fetch("http://localhost:3000/profile", {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          setStatus("guest");
          return;
        }

        const profile = await res.json();
        if (requiredRole === "ADMIN" && profile?.role !== "ADMIN") {
          setStatus("forbidden");
          return;
        }

        setStatus("auth");
      })
      .catch(() => setStatus("guest"));
  }, [requiredRole]);

  if (status === "loading") return <p>Loading...</p>;

  if (status === "guest") return <Navigate to="/" replace />;

  if (status === "forbidden") return <Navigate to="/gyms" replace />;

  return <>{children}</>;
}
