# App Store, Google Play & Razorpay Compliance Requirements

This document tracks all mandatory legal, privacy, and regulatory pages required for store approval (Apple App Store & Google Play Console) and payment gateway compliance (Razorpay).

---

## 1. Required Pages & Disclosures

| # | Page / Route | Mandatory For | Key Purpose & Review Requirements | Status |
|---|---|---|---|---|
| 1 | `/privacy` | Google Play, Apple App Store, Razorpay | Details data collection (name, phone, address, medical conditions, device FCM tokens), storage encryption, third parties (Firebase, Razorpay, MongoDB Atlas), and user rights. | Pending Client Info |
| 2 | `/terms` | Google Play, Apple App Store, Razorpay | Rules of service, appointment booking terms, home visit conduct, cancellation conditions, and platform liabilities. | Pending Client Info |
| 3 | `/medical-disclaimer` | Apple Guideline 1.4 & Google Health Policy | **Critical for Health Apps**: Explicit disclaimer stating the app is not for medical emergencies, and exercises/rehabilitation require practitioner guidance. | Pending Client Info |
| 4 | `/refund-policy` | Razorpay Gateway & Apple App Store | Transparent cancellation window (e.g. 2–4 hours prior to appointment), refund processing time (5–7 business days to source), and no-show policies. | Pending Client Info |
| 5 | `/delete-account` | Apple Guideline 5.1.1(v) & Google Play Policy | **Mandatory Account Deletion**: Public web URL + in-app mechanism where users can request complete erasure of account, personal details, and medical records. | Pending Client Info |
| 6 | `/contact-us` | Google Play, Apple, Razorpay, Indian IT Act | Official business entity name, physical clinic address, helpline phone number, support email, and Grievance Officer details. | Pending Client Info |
| 7 | `/fulfillment-policy` | Razorpay Payment Compliance | Explains service delivery flow (instant booking confirmation, notifications, certified therapist home visits). | Pending Client Info |

---

## 2. Details Needed from Client

Please collect the following information from the client:

1. **Official Legal / Registered Entity Name**:  
   - *Example: "Dr. Bariyar's QuickPhysio24 Clinic" or registered LLP/Pvt Ltd name.*
2. **Complete Physical Clinic Address**:  
   - *Example: Clinic address, Road/Area, City, State, PIN code.*
3. **Official Support Email & Phone Number**:  
   - *Example: support@quickphysio24.com / +91-XXXXXXXXXX.*
4. **Cancellation Window for Full Refund**:  
   - *Example: Can patients cancel up to 2 hours or 4 hours before slot time for a 100% refund?*
5. **Grievance Officer Details (India IT Act compliance)**:  
   - *Name, designation (e.g. Dr. Rajnish Bariyar / Clinic Director), and contact email.*

---

## 3. Implementation Plan Once Details Are Provided

1. Create responsive Next.js public routes under `apps/admin-nextjs/src/app/(public)/...`:
   - `/privacy`
   - `/terms`
   - `/medical-disclaimer`
   - `/refund-policy`
   - `/delete-account`
   - `/contact-us`
2. Integrate account deletion server action & API endpoint.
3. Link the policies directly inside the mobile Flutter app:
   - In `SettingsScreen` (under "About & Legal").
   - In `LoginScreen` & `RegisterScreen` footer links.

