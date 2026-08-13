# Physiotherapy Appointment Booking Platform

This is a modern monorepo containing the Physiotherapy Appointment Booking Platform.

## Folder Structure

- `apps/`
  - `admin-nextjs/` - Next.js Admin Panel web app.
  - `backend-nextjs/` - Next.js REST API Backend server.
  - `mobile-flutter/` - Flutter Patient-facing mobile app.
- `packages/`
  - `shared-types/` - Shared TypeScript interfaces and types.
- `database/`
  - `models/` - Mongoose schemas and models.
  - `seed/` - Database seeding scripts.
- `docs/`
  - `api/` - HTTP request files and API specifications.

## Prerequisites

- Node.js >= v20
- MongoDB Atlas or local MongoDB
- Flutter SDK (for mobile app)

## Getting Started

1. Install root dependencies:
   ```bash
   npm install
   ```
2. Configure credentials in environment files.
