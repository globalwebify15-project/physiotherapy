# Physiotherapy Appointment Booking Platform — Deployment & Configuration Guide

## 1. Environment Variables Overview

Create `.env` files in `apps/backend-nextjs/` and `apps/admin-nextjs/` (or supply them in your hosting provider's environment settings).

```env
# MongoDB Atlas Connection
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"

# JWT Secrets for Authentication
JWT_SECRET="generate_a_secure_random_string_for_jwt_access"
JWT_REFRESH_SECRET="generate_a_secure_random_string_for_jwt_refresh"

# Razorpay Credentials (from Razorpay Dashboard)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Firebase Cloud Messaging (Service Account JSON)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# SMS Gateway (e.g. Fast2SMS / MSG91 / Twilio)
SMS_GATEWAY_API_KEY="your_sms_gateway_api_key"
SMS_SENDER_ID="QPHYSIO"

# Public API URL for Flutter & Admin connections
BASE_URL="https://your-backend-domain.com"
NEXT_PUBLIC_API_URL="https://your-backend-domain.com/api"
```

---

## 2. Backend & Admin Deployment (Vercel / Node.js Host)

### Deployment on Vercel:
1. Connect your Git repository to Vercel.
2. Create two projects:
   - **Backend API**: Root Directory = `apps/backend-nextjs`
   - **Admin Portal**: Root Directory = `apps/admin-nextjs`
3. Add the environment variables listed above in Project Settings -> Environment Variables.
4. Deploy both services.

### Deployment on Ubuntu VPS (Docker / PM2):
```bash
# 1. Install dependencies at root
npm install

# 2. Build backend
cd apps/backend-nextjs
npm install
npm run build
pm2 start npm --name "physio-backend" -- start -- -p 4000

# 3. Build admin
cd ../admin-nextjs
npm install
npm run build
pm2 start npm --name "physio-admin" -- start -- -p 3001
```

---

## 3. Flutter Mobile App Release Build (Android & iOS)

### Android Release APK / Bundle:
```bash
cd apps/mobile-flutter
flutter clean
flutter pub get

# Build Release APK
flutter build apk --release

# Build Google Play App Bundle (AAB)
flutter build appbundle --release
```
The output APK will be generated at:
`apps/mobile-flutter/build/app/outputs/flutter-apk/app-release.apk`
