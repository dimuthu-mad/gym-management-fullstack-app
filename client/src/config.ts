const isProduction = import.meta.env.PROD;

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (isProduction
    ? "https://fittrack-backend-k8ln.onrender.com"
    : "http://localhost:3000");
