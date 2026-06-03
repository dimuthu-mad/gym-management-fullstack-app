import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../config";

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
    let cancelled = false;
    let timeoutId: number | undefined;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timeoutId = window.setTimeout(resolve, ms);
      });

    const check = async () => {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          const res = await fetch(`${API_URL}/profile`, {
            credentials: "include",
          });

          if (cancelled) return;

          if (!res.ok) {
            if (attempt < 3) {
              await sleep(250);
              continue;
            }
            setStatus("guest");
            return;
          }

          const profile = await res.json();
          if (requiredRole === "ADMIN" && profile?.role !== "ADMIN") {
            setStatus("forbidden");
            return;
          }

          setStatus("auth");
          return;
        } catch {
          if (cancelled) return;
          if (attempt < 3) {
            await sleep(250);
            continue;
          }
          setStatus("guest");
          return;
        }
      }
    };

    check();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [requiredRole]);

  if (status === "loading") return <p>Loading...</p>;

  if (status === "guest") return <Navigate to="/" replace />;

  if (status === "forbidden") return <Navigate to="/gyms" replace />;

  return <>{children}</>;
}
