import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  if (kDebugMode) {
    print('[FCM BACKGROUND MESSAGE]: ${message.messageId} - ${message.notification?.title}');
  }
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final ApiService _apiService = ApiService();
  String? _fcmToken;

  String? get fcmToken => _fcmToken;

  /// Initializes Firebase and sets up Push Notification listeners
  Future<void> initialize() async {
    try {
      await Firebase.initializeApp();
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Request notification permissions
      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional) {
        // Fetch FCM Device Token
        _fcmToken = await messaging.getToken();
        if (kDebugMode) {
          print('[FCM DEVICE TOKEN]: $_fcmToken');
        }

        // Register token with backend if authenticated
        if (_fcmToken != null) {
          await registerTokenWithBackend(_fcmToken!);
        }

        // Listen for token refresh
        messaging.onTokenRefresh.listen((newToken) async {
          _fcmToken = newToken;
          await registerTokenWithBackend(newToken);
        });

        // Foreground notification handler
        FirebaseMessaging.onMessage.listen((RemoteMessage message) {
          if (kDebugMode) {
            print('[FCM FOREGROUND MESSAGE]: ${message.notification?.title} - ${message.notification?.body}');
          }
        });

        // App opened from notification
        FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
          if (kDebugMode) {
            print('[FCM NOTIFICATION OPENED]: ${message.data}');
          }
        });
      }
    } catch (e) {
      if (kDebugMode) {
        print('[FCM INITIALIZATION ERROR (Ignored in development)]: $e');
      }
    }
  }

  /// Sends the device token to the backend API
  Future<void> registerTokenWithBackend([String? token]) async {
    final t = token ?? _fcmToken;
    if (t == null || t.isEmpty) return;

    try {
      final storage = FlutterSecureStorage();
      final currentMobile = await storage.read(key: 'userMobile') ?? '';

      await _apiService.post(
        '/notifications/token',
        data: {
          'token': t,
          'mobile': currentMobile,
        },
      );
      if (kDebugMode) {
        print('[FCM TOKEN REGISTERED WITH BACKEND for $currentMobile]');
      }
    } catch (e) {
      if (kDebugMode) {
        print('[FCM TOKEN BACKEND SYNC ERROR]: $e');
      }
    }
  }
}
