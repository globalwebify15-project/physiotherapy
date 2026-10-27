# Physiotherapy Appointment Booking Platform — System Architecture

## 1. High-Level Architecture Overview

The platform consists of three core applications backed by a centralized database and cloud services:

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     Mobile App (Flutter)        │       │    Admin Portal (Next.js)       │
│  - Patient Booking & Profiles   │       │  - Staff RBAC & CMS Controls    │
│  - Appointments & Pain Tracker  │       │  - Financials, Reports & Logs   │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │ (REST / JSON)                           │ (Server Actions & REST)
                 ▼                                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    Next.js Backend API Service                            │
│  - JWT Authentication Middleware                                          │
│  - Dynamic Slot Availability & Conflict Resolution                        │
│  - Razorpay Order Lifecycle & Webhooks                                    │
│  - Push Notification Center (FCM)                                         │
│  - Moderated Feedback & Analytics Reporting                               │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   MongoDB Atlas Database  │
                        │ - Multi-collection schemas│
                        │ - Indexed relations       │
                        └───────────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 Backend (`apps/backend-nextjs`)
- **Framework**: Next.js 16 (App Router)
- **Role**: RESTful API Provider for patient mobile apps and administrative integrations.
- **Key Modules**:
  - `/api/auth`: Mobile OTP login, JWT access/refresh token rotation, admin credential verification.
  - `/api/appointments`: Creation, conflict detection, dynamic time-slot generation, rescheduling, status timeline tracking.
  - `/api/payments`: Razorpay order creation, HMAC-SHA256 signature verification, transaction history logging.
  - `/api/reviews`: Moderated reviews with therapist rating recomputation, edit/delete by patient ID.
  - `/api/notifications`: Inbox notification retrieval, push broadcast dispatch, device token registration.
  - `/api/cms`: Key-value CMS configuration for banners, FAQs, testimonials, clinic policies.
  - `/api/reports`: Aggregated data exports for revenue, appointments, therapists, and patients.

### 2.2 Admin Panel (`apps/admin-nextjs`)
- **Framework**: Next.js 16 with Tailwind CSS 4 & Lucide Icons.
- **Role**: Clinic management console for administrators, receptionists, and supervisors.
- **Features**:
  - Live KPI metrics and Recharts visualizations.
  - CRUD management for treatments and active physiotherapists.
  - Staff RBAC provisioning with bcrypt password hashing.
  - Multi-format report export (Excel `.xls`, CSV `.csv`, and print-ready PDF).

### 2.3 Mobile Application (`apps/mobile-flutter`)
- **Framework**: Flutter with Material Design 3.
- **State Management**: Riverpod & Flutter Secure Storage.
- **Networking**: Dio with bearer token injection and offline fallback cache.
- **Key Features**:
  - Interactive onboarding and mobile OTP authentication.
  - Treatment service explorer with clinic and home visit options.
  - Booking & rescheduling flow with real-time slot selection.
  - Razorpay payment checkout integration.
  - Guided exercise timer and anatomical interactive pain tracker.
  - Direct doctor telephone calling and WhatsApp chat integration.

---

## 3. Database Collections & Relationships

| Collection | Description | Key Relationships |
| :--- | :--- | :--- |
| `users` | Accounts, roles, mobile numbers, FCM device tokens | Referenced by `patients`, `notifications` |
| `patients` | Detailed patient profile, emergency contact, medical notes | Belongs to `users` |
| `therapists`| Doctor qualifications, experience, specialties, working hours | Referenced by `appointments`, `reviews` |
| `services` | Treatment categories, duration, clinic/home pricing | Referenced by `appointments`, `reviews` |
| `appointments` | Bookings, dates, slots, visit types, status timeline | Belongs to `patients`, `services`, `therapists` |
| `payments` | Razorpay orders, transaction IDs, statuses, histories | Belongs to `appointments` |
| `reviews` | Star ratings, comments, moderation flags | Belongs to `patients`, `therapists`, `services` |
| `notifications` | In-app notification logs, push alerts, read statuses | Belongs to `users` |
| `cms` | Dynamic homepage banners, FAQs, testimonials, clinic details | Independent key-value documents |
