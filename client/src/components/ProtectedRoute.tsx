import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"loading" | "auth" | "guest">("loading");

  useEffect(() => {
    fetch("http://localhost:3000/profile", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) setStatus("auth");
        else setStatus("guest");
      })
      .catch(() => setStatus("guest"));
  }, []);

  if (status === "loading") return <p>Loading...</p>;

  if (status === "guest") return <Navigate to="/" replace />;

  return <>{children}</>;
}
