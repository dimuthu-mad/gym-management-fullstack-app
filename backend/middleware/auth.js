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
import { ensureUserFromProfile } from "../auth-user.js";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const baseURL =
  process.env.BASE_URL ||
  (isProduction
    ? "https://fittrack-backend-k8ln.onrender.com"
    : "http://localhost:3000");

const config = {
  authRequired: false,
  auth0Logout: true,
  secret:
    process.env.SECRET || "test-secret-test-secret-test-secret-test-secret",
  baseURL,
  clientID: process.env.CLIENT_ID || "test-client-id",
  issuerBaseURL: process.env.ISSUER_BASE_URL || "https://example.com",
  errorOnRequiredAuth: true,

  session: {
    cookie: {
      sameSite: isProduction ? "None" : "Lax",
      secure: isProduction,
      httpOnly: true,
    },
  },
  transactionCookie: {
    sameSite: isProduction ? "None" : "Lax",
  },

  afterCallback: async (_req, _res, session) => {
    const userProfile = session?.user;

    if (userProfile?.sub && userProfile?.email) {
      try {
        await ensureUserFromProfile(userProfile, "USER");
      } catch (error) {
        console.error(error?.stack || error);
      }
    }

    return session;
  },
};

let authMiddleware;
if (process.env.NODE_ENV === "test") {
  authMiddleware = (req, res, next) => {
    req.oidc = {
      isAuthenticated: () => false,
      user: null,
    };
    return next();
  };
} else {
  authMiddleware = auth(config);
}

export const syncUserFromOidc = async (req, res, next) => {
  if (!req.oidc?.isAuthenticated?.()) {
    return next();
  }

  const profile = req.oidc?.user;
  if (!profile?.sub || !profile?.email) {
    return next();
  }

  try {
    req.currentUser = await ensureUserFromProfile(profile, "USER");
  } catch (error) {
    console.error(error?.stack || error);
  }

  return next();
};

export { authMiddleware };
