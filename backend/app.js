// backend/index.js
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./middleware/auth.js";
import { ensureUserFromProfile } from "./auth-user.js";
import pkg from "express-openid-connect";
const { requiresAuth } = pkg;

const app = express();
const prisma = new PrismaClient();

app.use(authMiddleware); // Apply Auth0 middleware globally
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from the React app
    credentials: true, // Allow cookies to be sent
  }),
);

const formatReview = (review) => ({
  id: review.id,
  user: review.user?.name || review.user?.email || "Unknown user",
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt ? review.createdAt.toISOString() : undefined,
});

// Protected route
app.get("/", (req, res) => {
  return res.oidc.login({
    returnTo: "http://localhost:5173",
  });
});

app.get("/gyms", async (req, res) => {
  try {
    const gyms = await prisma.gym.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json(gyms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to load gyms" });
  }
});

app.patch("/reviews/:id", requiresAuth(), async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    if (!Number.isInteger(reviewId)) {
      return res.status(400).json({ error: "Invalid review id" });
    }

    const profile = req.oidc?.user;
    if (!profile?.sub)
      return res.status(401).json({ error: "Not authenticated" });

    const currentUser = await ensureUserFromProfile(profile, "USER");

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) return res.status(404).json({ error: "Review not found" });
    if (review.userId !== currentUser.id)
      return res
        .status(403)
        .json({ error: "Not allowed to update this review" });

    const rating =
      req.body.rating === undefined ? undefined : Number(req.body.rating);
    const comment =
      req.body.comment === undefined
        ? undefined
        : String(req.body.comment).trim();

    const data = {};
    if (rating !== undefined) {
      if (Number.isNaN(rating))
        return res.status(400).json({ error: "Invalid rating" });
      data.rating = rating;
    }
    if (comment !== undefined) {
      if (!comment)
        return res.status(400).json({ error: "Comment cannot be empty" });
      data.comment = comment;
    }

    if (Object.keys(data).length === 0)
      return res.status(400).json({ error: "No updatable fields provided" });

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    res.json(formatReview(updated));
  } catch (error) {
    console.error(error?.stack || error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

app.get("/gyms/:id", async (req, res) => {
  try {
    const gymId = Number(req.params.id);
    if (!Number.isInteger(gymId)) {
      return res.status(400).json({ error: "Invalid gym id" });
    }

    const gym = await prisma.gym.findUnique({
      where: {
        id: gymId,
      },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    res.json({
      ...gym,
      reviews: gym.reviews.map(formatReview),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to load gym" });
  }
});

app.post("/gyms/:id/reviews", requiresAuth(), async (req, res) => {
  try {
    const gymId = Number(req.params.id);
    if (!Number.isInteger(gymId)) {
      return res.status(400).json({ error: "Invalid gym id" });
    }

    const gym = await prisma.gym.findUnique({
      where: {
        id: gymId,
      },
    });

    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();
    if (!comment || Number.isNaN(rating)) {
      return res.status(400).json({ error: "Rating and comment are required" });
    }

    const profile = req.oidc?.user;
    if (!profile?.sub || !profile?.email) {
      return res
        .status(401)
        .json({ error: "Authenticated user profile is required" });
    }

    const currentUser = await ensureUserFromProfile(profile, "USER");

    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: currentUser.id,
        gymId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(formatReview(newReview));
  } catch (error) {
    console.error(error?.stack || error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

app.post("/gyms", requiresAuth(), async (req, res) => {
  try {
    const { name, location, description } = req.body;
    const rating =
      req.body.rating === undefined || req.body.rating === ""
        ? null
        : Number(req.body.rating);
    const membershipPrice =
      req.body.membershipPrice === undefined || req.body.membershipPrice === ""
        ? null
        : Number(req.body.membershipPrice);

    if (!name || !location) {
      return res.status(400).json({ error: "Name and location are required" });
    }

    const newGym = await prisma.gym.create({
      data: {
        name,
        location,
        description: description || null,
        rating: Number.isNaN(rating) ? null : rating,
        membershipPrice: Number.isNaN(membershipPrice) ? null : membershipPrice,
      },
    });

    res.status(201).json({
      ...newGym,
      reviews: [],
    });
  } catch (error) {
    console.error(error?.stack || error);
    res.status(500).json({ error: "Failed to create gym" });
  }
});

app.get("/profile", requiresAuth(), async (req, res) => {
  try {
    const profile = req.oidc?.user;
    if (!profile) return res.status(401).json({ error: "Not authenticated" });

    const user = await ensureUserFromProfile(profile, "USER");
    res.json(user);
  } catch (error) {
    console.error(error?.stack || error);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

const getGymReviewsCount = async (req, res) => {
  try {
    const gymId = Number(req.params.id);
    if (!Number.isInteger(gymId)) {
      return res.status(400).json({ error: "Invalid gym id" });
    }

    const reviewCount = await prisma.review.count({
      where: {
        gymId,
      },
    });
    res.json({ count: reviewCount });
  } catch (error) {
    console.error(error?.stack || error);
    res.status(500).json({ error: "Failed to load review count" });
  }
};

// Support both spellings to avoid frontend/backend mismatch.
app.get("/gyms/:id/reviewcount", getGymReviewsCount);
app.get("/gyms/:id/reviewscount", getGymReviewsCount);

app.get("/auth/logout", (req, res) => {
  return res.oidc.logout({
    returnTo: process.env.FRONTEND_URL || "http://localhost:5173",
  });
});

export default app;
