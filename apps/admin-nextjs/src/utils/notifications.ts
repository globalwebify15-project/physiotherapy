import { Notification, User } from 'database';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import path from 'path';
import fs from 'fs';

let firebaseApp: App | null = null;

function getFirebaseAdmin(): App | null {
  if (firebaseApp) return firebaseApp;
  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0]!;
      return firebaseApp;
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseApp = initializeApp({
          credential: cert(serviceAccount),
        });
        console.log('[FIREBASE ADMIN SDK] Initialized from FIREBASE_SERVICE_ACCOUNT env var.');
        return firebaseApp;
      } catch (e) {
        console.warn('[FIREBASE ADMIN SDK] Failed to parse FIREBASE_SERVICE_ACCOUNT env:', e);
      }
    }

    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'quickphysio24',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('[FIREBASE ADMIN SDK] Initialized from individual env vars.');
      return firebaseApp;
    }

    const serviceAccountPath = path.resolve(process.cwd(), 'src/config/firebase-admin.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('[FIREBASE ADMIN SDK] Initialized with service account credentials file.');
      return firebaseApp;
    }
  } catch (err) {
    console.warn('[FIREBASE ADMIN SDK WARNING] Failed to initialize:', err);
  }
  return null;
}

/**
 * Utility to dispatch a notification.
 * 1. Saves notification record in MongoDB.
 * 2. Transmits push notification to active device tokens via Firebase Cloud Messaging (FCM).
 */
export async function createNotification(
  userId: string | any,
  title: string,
  body: string,
  type: 'booking_alert' | 'payment_alert' | 'reminder' | 'announcement',
  metadata?: any
) {
  try {
    // 1. Save record in database
    const notification = await Notification.create({
      userId,
      title,
      body,
      type,
      metadata,
      isRead: false,
    });

    // 2. Dispatch real Push Notification via Firebase Cloud Messaging
    try {
      const fbApp = getFirebaseAdmin();
      if (fbApp) {
        const user = await User.findById(userId);
        const tokens: string[] = user?.fcmTokens || [];

        if (tokens.length > 0) {
          const response = await getMessaging(fbApp).sendEachForMulticast({
            tokens,
            notification: {
              title,
              body,
            },
            data: metadata
              ? Object.entries(metadata).reduce((acc: any, [k, v]) => {
                  acc[k] = String(v);
                  return acc;
                }, {})
              : undefined,
          });

          console.log(
            `[FCM PUSH SENT] Success: ${response.successCount}, Failure: ${response.failureCount} for user ${userId}`
          );

          // Clean up invalid or expired tokens
          if (response.failureCount > 0) {
            const invalidTokens: string[] = [];
            response.responses.forEach((resp: any, idx: number) => {
              if (!resp.success) {
                const errCode = resp.error?.code;
                if (
                  errCode === 'messaging/invalid-registration-token' ||
                  errCode === 'messaging/registration-token-not-registered'
                ) {
                  invalidTokens.push(tokens[idx]);
                }
              }
            });
            if (invalidTokens.length > 0) {
              await User.findByIdAndUpdate(userId, {
                $pull: { fcmTokens: { $in: invalidTokens } },
              });
            }
          }
        }
      }
    } catch (fcmErr) {
      console.error('[FCM TRANSMISSION WARNING]:', fcmErr);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}
