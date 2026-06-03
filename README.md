# FitTrack - Gym Discovery & Review Platform

FitTrack is a full-stack web application that helps users discover gyms, compare facilities, read reviews, and share their own experiences.

The project was developed as part of the Full-Stack Development & Production Deployment course and demonstrates:

- Full-stack application development
- Authentication with Auth0
- PostgreSQL database integration
- Docker containerization
- Cloud deployment
- CI/CD with GitHub Actions

---

## Live Application

### Frontend (Vercel)
https://fittrack-client-kappa.vercel.app

### Backend (Render)
https://fittrack-backend-k8ln.onrender.com

---

## Features

### User Features
- Browse gyms
- View gym details
- Read reviews
- Submit reviews
- Edit own reviews
- Create workout schedules
- View personal schedules
- User authentication with Auth0

### Admin Features
- Create new gyms
- View all schedules
- Manage application data

---

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express
- Database: PostgreSQL (Render)
- Authentication: Auth0
- Deployment: Vercel + Render
- CI/CD: GitHub Actions
- Containerization: Docker

## Environment Variables

### Backend `.env`

```env
DATABASE_URL=
SECRET=
BASE_URL=http://localhost:3000
CLIENT_ID=
ISSUER_BASE_URL=
FRONTEND_URL=http://localhost:5173
PORT=3000
```
### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000
```
## Install and Run Locally

### Prerequisites

- Docker Desktop
- Git

### Clone the Repository

```bash
git clone <repository-url>
cd gym-management-fullstack-app
```

### Run with Docker

Build and start all services:

```bash
docker compose up --build
```

The application will be available at:

Frontend:
```text
http://localhost:5173
```

Backend:
```text
http://localhost:3000
```

### Stop the Application

```bash
docker compose down
```
Run Prisma migration and seed inside Docker:

```bash
docker compose exec server npx prisma migrate deploy
docker compose exec server npx prisma db seed
```

## Deployment

- Frontend is deployed on Vercel.
- Backend is deployed on Render.
- Database is hosted using Render PostgreSQL.
- Environment variables are configured separately in Vercel and Render.

## Security

- Secrets are stored in `.env` files and cloud environment variables.
- `.env` files are not committed to GitHub.
- CORS is restricted to the frontend URL.
- Authentication is handled using Auth0.
- HTTPS is used in production.

## Reflections

### Why did I choose Vercel and Render?

I used Vercel for the frontend because it is easy to deploy React/Vite applications. I used Render for the backend and PostgreSQL database because it supports Node.js applications and managed databases.

### What challenges did I face with Docker?

The main challenge was connecting the backend container to the PostgreSQL container and using the correct database URL inside Docker.

### How did I handle environment variables and secrets?

Local environment variables are stored in `.env` files. Production variables are stored in Vercel and Render environment settings. Secrets are not committed to GitHub.

### What would I do differently with one more week?

I would improve the UI, add more tests, improve admin features, and add better error handling.

### How did I ensure authentication works after deployment?

I updated Auth0 callback URLs, logout URLs, allowed origins, and backend CORS settings to use the deployed frontend and backend URLs.
