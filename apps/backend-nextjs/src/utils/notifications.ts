import { Notification } from 'database';

/**
 * Utility to dispatch a notification.
 * Saves the notification log in MongoDB and simulates a Push Notification alert in the console.
 */
export async function createNotification(
  userId: string | any,
  title: string,
  body: string,
  type: 'booking_alert' | 'payment_alert' | 'reminder' | 'announcement',
  metadata?: any
) {
  try {
    // Save to database
    const notification = await Notification.create({
      userId,
      title,
      body,
      type,
      metadata,
      isRead: false,
    });

    // Simulate Push Notification dispatch (FCM Sandbox bypass)
    console.log(`\n========================================================================`);
    console.log(`[PUSH NOTIFICATION DISPATCHED] (FCM Sandbox Mode)`);
    console.log(`   To User ID : ${userId}`);
    console.log(`   Title      : ${title}`);
    console.log(`   Body       : ${body}`);
    console.log(`   Type       : ${type}`);
    if (metadata) {
      console.log(`   Metadata   : ${JSON.stringify(metadata)}`);
    }
    console.log(`========================================================================\n`);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}
