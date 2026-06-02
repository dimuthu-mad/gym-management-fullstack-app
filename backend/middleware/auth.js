/*import { auth } from "express-openid-connect";
import dotenv from "dotenv";
dotenv.config();

// Auth0 configuration
const config = {
  authRequired: false, // Allow public routes
  auth0Logout: true, // Use Auth0 logout endpoint
  secret: process.env.SECRET || "test-secret",
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  clientID: process.env.CLIENT_ID || "test-client-id",
  issuerBaseURL: process.env.ISSUER_BASE_URL || "https://example.auth0.com",
  errorOnRequiredAuth: true,
};

export const authMiddleware = auth(config);
// export const requireAuth = requiresAuth();
*/

import { auth } from "express-openid-connect";
import dotenv from "dotenv";

dotenv.config();

const baseURL =
  process.env.BASE_URL && process.env.BASE_URL.startsWith("http")
    ? process.env.BASE_URL
    : "http://localhost:3000";

const config = {
  authRequired: false,
  auth0Logout: true,
  secret:
    process.env.SECRET || "test-secret-test-secret-test-secret-test-secret",
  baseURL,
  clientID: process.env.CLIENT_ID || "test-client-id",
  issuerBaseURL: process.env.ISSUER_BASE_URL || "https://example.com",
  errorOnRequiredAuth: true,
};

export const authMiddleware = auth(config);
