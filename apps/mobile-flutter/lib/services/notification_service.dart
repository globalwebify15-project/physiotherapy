import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../main.dart';
import '../utils/app_storage.dart';
import '../widgets/notifications_sheet.dart';
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

      final messaging = FirebaseMessaging.instance;

      // Allow foreground notifications presentation
      await messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // Request notification permissions
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

        // Register token with backend if mobile is stored
        await registerTokenWithBackend(_fcmToken);

        // Listen for token refresh
        messaging.onTokenRefresh.listen((newToken) async {
          _fcmToken = newToken;
          await registerTokenWithBackend(newToken);
        });

        // 1. Foreground notification handler (when screen is ON)
        FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
          if (kDebugMode) {
            print('[FCM FOREGROUND MESSAGE]: ${message.notification?.title} - ${message.notification?.body}');
          }
          await _saveIncomingNotification(message);
          _showForegroundInAppBanner(message);
        });

        // 2. Notification opened from background (when screen was OFF / backgrounded)
        FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) async {
          if (kDebugMode) {
            print('[FCM NOTIFICATION OPENED FROM BACKGROUND]: ${message.data}');
          }
          await _saveIncomingNotification(message);
          _openNotificationCenter();
        });

        // 3. Notification opened from terminated / killed state
        final initialMessage = await messaging.getInitialMessage();
        if (initialMessage != null) {
          if (kDebugMode) {
            print('[FCM INITIAL MESSAGE FROM COLD START]: ${initialMessage.data}');
          }
          await _saveIncomingNotification(initialMessage);
          Future.delayed(const Duration(milliseconds: 1200), () {
            _openNotificationCenter();
          });
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('[FCM INITIALIZATION ERROR (Ignored in development)]: $e');
      }
    }
  }

  /// Displays an in-app heads-up floating banner when a notification arrives with screen ON
  void _showForegroundInAppBanner(RemoteMessage message) {
    final title = message.notification?.title ?? message.data['title'] ?? 'New Notification';
    final body = message.notification?.body ?? message.data['body'] ?? '';

    rootScaffoldMessengerKey.currentState?.removeCurrentSnackBar();
    rootScaffoldMessengerKey.currentState?.showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        padding: const EdgeInsets.all(14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        backgroundColor: const Color(0xFF0F766E),
        elevation: 6,
        duration: const Duration(seconds: 5),
        content: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.notifications_active_rounded, color: Colors.white, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14),
                  ),
                  if (body.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      body,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
        action: SnackBarAction(
          label: 'VIEW',
          textColor: Colors.amberAccent,
          onPressed: () {
            _openNotificationCenter();
          },
        ),
      ),
    );
  }

  /// Opens the Notification Sheet modally
  void _openNotificationCenter() {
    final ctx = rootNavigatorKey.currentContext;
    if (ctx != null) {
      showNotificationsSheet(ctx);
    }
  }

  /// Saves incoming remote message into local storage cache
  Future<void> _saveIncomingNotification(RemoteMessage message) async {
    try {
      final title = message.notification?.title ?? message.data['title'] ?? 'Notification';
      final body = message.notification?.body ?? message.data['body'] ?? '';
      final type = message.data['type'] ?? 'announcement';

      final newNotif = {
        '_id': message.messageId ?? 'notif_${DateTime.now().millisecondsSinceEpoch}',
        'title': title,
        'body': body,
        'type': type,
        'createdAt': DateTime.now().toIso8601String(),
        'isRead': false,
      };

      final currentMobile = await AppStorage.read(key: 'userMobile') ?? '';
      final cleanMobile = currentMobile.replaceAll(RegExp(r'^\+91'), '').trim();
      final cacheKey = 'notifications_$cleanMobile';
      final cachedJson = await AppStorage.read(key: cacheKey);
      List<dynamic> list = [];
      if (cachedJson != null && cachedJson.isNotEmpty) {
        try {
          list = jsonDecode(cachedJson) as List<dynamic>;
        } catch (_) {}
      }
      list.insert(0, newNotif);
      if (list.length > 50) list = list.sublist(0, 50);
      await AppStorage.write(key: cacheKey, value: jsonEncode(list));
    } catch (e) {
      if (kDebugMode) print('[Save Incoming Notification Error]: $e');
    }
  }

  /// Sends the device token to the backend API
  Future<void> registerTokenWithBackend([String? token]) async {
    try {
      if (token != null && token.isNotEmpty) {
        _fcmToken = token;
      }
      if (_fcmToken == null || _fcmToken!.isEmpty) {
        try {
          _fcmToken = await FirebaseMessaging.instance.getToken();
        } catch (_) {}
      }

      final t = _fcmToken;
      if (t == null || t.isEmpty) return;

      final currentMobile = await AppStorage.read(key: 'userMobile') ?? '';
      if (currentMobile.isEmpty) return;

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

  /// Fetches patient's notifications from the backend API, merging with local cache
  Future<List<Map<String, dynamic>>> fetchNotifications() async {
    final currentMobile = await AppStorage.read(key: 'userMobile') ?? '';
    final cleanMobile = currentMobile.replaceAll(RegExp(r'^\+91'), '').trim();
    final cacheKey = 'notifications_$cleanMobile';

    List<Map<String, dynamic>> result = [];

    // 1. Try fetching from live backend
    try {
      final res = await _apiService.get(
        '/notifications',
        queryParameters: {'mobile': cleanMobile},
      );
      if (res.statusCode == 200 && res.data is Map && res.data['notifications'] is List) {
        final list = (res.data['notifications'] as List)
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList();
        result = list;
        await AppStorage.write(key: cacheKey, value: jsonEncode(result));
        return result;
      }
    } catch (e) {
      if (kDebugMode) print('[Fetch Notifications Live Error]: $e');
    }

    // 2. Fallback to cached notifications
    try {
      final cachedJson = await AppStorage.read(key: cacheKey);
      if (cachedJson != null && cachedJson.isNotEmpty) {
        final list = (jsonDecode(cachedJson) as List)
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList();
        return list;
      }
    } catch (_) {}

    return result;
  }
}
