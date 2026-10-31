import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Centralized safe secure storage wrapper.
/// Prevents Android KeyStore `BadPaddingException: BAD_DECRYPT` when an app is reinstalled
/// or updated over old encrypted SharedPreferences.
class AppStorage {
  static const AndroidOptions _androidOptions = AndroidOptions(
    encryptedSharedPreferences: true,
    resetOnError: true,
  );

  static const IOSOptions _iosOptions = IOSOptions(
    accessibility: KeychainAccessibility.first_unlock,
  );

  static const FlutterSecureStorage _storage = FlutterSecureStorage(
    aOptions: _androidOptions,
    iOptions: _iosOptions,
  );

  static FlutterSecureStorage get instance => _storage;

  /// Safe read with automatic self-healing on KeyStore decryption error
  static Future<String?> read({required String key}) async {
    try {
      return await _storage.read(key: key);
    } catch (e) {
      debugPrint('[AppStorage.read Error for $key]: $e - auto-healing key');
      try {
        await _storage.delete(key: key);
      } catch (_) {}
      return null;
    }
  }

  /// Safe write with automatic recovery
  static Future<void> write({required String key, required String? value}) async {
    if (value == null) {
      await delete(key: key);
      return;
    }
    try {
      await _storage.write(key: key, value: value);
    } catch (e) {
      debugPrint('[AppStorage.write Error for $key]: $e - clearing stale entry and retrying');
      try {
        await _storage.delete(key: key);
        await _storage.write(key: key, value: value);
      } catch (retryErr) {
        debugPrint('[AppStorage.write Retry Failed]: $retryErr');
      }
    }
  }

  /// Safe delete
  static Future<void> delete({required String key}) async {
    try {
      await _storage.delete(key: key);
    } catch (e) {
      debugPrint('[AppStorage.delete Error for $key]: $e');
    }
  }

  /// Safe clear all
  static Future<void> deleteAll() async {
    try {
      await _storage.deleteAll();
    } catch (e) {
      debugPrint('[AppStorage.deleteAll Error]: $e');
    }
  }
}

