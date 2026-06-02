import { auth } from "express-openid-connect";
import dotenv from "dotenv";
dotenv.config();

// Auth0 configuration
const config = {
  authRequired: false, // Allow public routes
  auth0Logout: true, // Use Auth0 logout endpoint
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  errorOnRequiredAuth: true,
};

export const authMiddleware = auth(config);
// export const requireAuth = requiresAuth();
