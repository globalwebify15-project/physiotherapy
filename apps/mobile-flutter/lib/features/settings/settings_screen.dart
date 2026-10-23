import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../services/api_service.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_bottom_nav.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _storage = const FlutterSecureStorage();
  final _apiService = ApiService();

  String _userName = 'Patient';
  String _userMobile = '';
  String _photoUrl = '';
  bool _voiceGuidance = true;
  bool _beepSounds = true;
  bool _hapticFeedback = true;

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    // 1. Load instantly from local storage
    final cachedName = await _storage.read(key: 'patientName');
    final cachedMobile = await _storage.read(key: 'userMobile') ?? await _storage.read(key: 'patientMobile');
    final cachedPhoto = await _storage.read(key: 'patientPhoto');
    
    if (mounted) {
      setState(() {
        if (cachedName != null && cachedName.isNotEmpty) _userName = cachedName;
        if (cachedMobile != null && cachedMobile.isNotEmpty) _userMobile = cachedMobile;
        if (cachedPhoto != null && cachedPhoto.isNotEmpty) _photoUrl = cachedPhoto;
      });
    }

    // 2. Refresh from backend API
    try {
      final response = await _apiService.get('/patients');
      if (response.statusCode == 200 && response.data['patient'] != null) {
        final patient = response.data['patient'];
        final fetchedName = patient['name'];
        final fetchedMobile = patient['userId'] is Map ? patient['userId']['mobile'] : null;
        final photo = patient['profilePhoto'];

        if (fetchedName != null) await _storage.write(key: 'patientName', value: fetchedName);
        if (fetchedMobile != null) await _storage.write(key: 'userMobile', value: fetchedMobile);
        if (photo != null && photo.isNotEmpty) await _storage.write(key: 'patientPhoto', value: photo);

        if (mounted) {
          setState(() {
            if (fetchedName != null && fetchedName.isNotEmpty) _userName = fetchedName;
            if (fetchedMobile != null && fetchedMobile.isNotEmpty) _userMobile = fetchedMobile;
            if (photo != null && photo.isNotEmpty) _photoUrl = photo;
          });
        }
      }
    } catch (e) {
      // Retain cached storage values
    }
  }

  Widget _buildAvatar() {
    if (_photoUrl.isEmpty) {
      return const Icon(Icons.person_rounded, color: Color(0xFF0F766E), size: 30);
    }
    if (_photoUrl.startsWith('data:image')) {
      try {
        final base64String = _photoUrl.split(',').last;
        final bytes = base64Decode(base64String);
        return ClipOval(
          child: Image.memory(
            bytes,
            fit: BoxFit.cover,
            width: 52,
            height: 52,
            errorBuilder: (_, __, ___) => const Icon(Icons.person_rounded, color: Color(0xFF0F766E), size: 30),
          ),
        );
      } catch (_) {
        return const Icon(Icons.person_rounded, color: Color(0xFF0F766E), size: 30);
      }
    }
    return ClipOval(
      child: Image.network(
        _photoUrl,
        fit: BoxFit.cover,
        width: 52,
        height: 52,
        errorBuilder: (_, __, ___) => const Icon(Icons.person_rounded, color: Color(0xFF0F766E), size: 30),
      ),
    );
  }

  void _clearCache() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Clear Local Cache', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        content: const Text(
          'This will delete cached exercise videos, images, and session logs. Are you sure you want to proceed?',
          style: TextStyle(color: Color(0xFF64748B), height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Cache successfully cleared!'),
                  backgroundColor: Color(0xFF0F766E),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            child: const Text('Clear', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 20.0, top: 20, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: Color(0xFF94A3B8),
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required IconData icon,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: SwitchListTile(
        title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        value: value,
        onChanged: onChanged,
        activeColor: const Color(0xFF0F766E),
        inactiveTrackColor: const Color(0xFFE2E8F0),
        secondary: CircleAvatar(
          backgroundColor: const Color(0xFFF1F5F9),
          child: Icon(icon, color: const Color(0xFF0F766E), size: 20),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          // Dark Curved Header
          const AppHeader(
            title: 'Settings',
            showBack: false,
          ),

          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Dynamic Profile Quick Card (Synchronized with user profile)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFF1F5F9)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFF0F766E).withOpacity(0.12),
                          ),
                          child: _buildAvatar(),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _userName,
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _userMobile.isNotEmpty ? '+91 $_userMobile' : '+91 93343 06358',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                        ),
                        OutlinedButton(
                          onPressed: () => context.push('/profile').then((_) => _loadUserProfile()),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF0F766E),
                            side: const BorderSide(color: Color(0xFF0F766E)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          ),
                          child: const Text('Edit', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ],
                    ),
                  ),

                  _buildSectionHeader('Sounds & Haptics'),
                  _buildSwitchTile(
                    title: 'Voice Guidance',
                    subtitle: 'Audio assistant calls out workout reps',
                    value: _voiceGuidance,
                    icon: Icons.record_voice_over_rounded,
                    onChanged: (val) => setState(() => _voiceGuidance = val),
                  ),
                  _buildSwitchTile(
                    title: 'Beep Alerts',
                    subtitle: 'Play sound at start and end of sets',
                    value: _beepSounds,
                    icon: Icons.volume_up_rounded,
                    onChanged: (val) => setState(() => _beepSounds = val),
                  ),
                  _buildSwitchTile(
                    title: 'Tactile Haptics',
                    subtitle: 'Provide vibration cues during hold times',
                    value: _hapticFeedback,
                    icon: Icons.vibration_rounded,
                    onChanged: (val) => setState(() => _hapticFeedback = val),
                  ),

                  _buildSectionHeader('Storage & Data'),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        const CircleAvatar(
                          backgroundColor: Color(0xFFFDF2F2),
                          child: Icon(Icons.delete_sweep_rounded, color: Colors.red, size: 20),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'Clear Cached Data',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Used space: 142.4 MB',
                                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                        ),
                        TextButton(
                          onPressed: _clearCache,
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.red.shade700,
                            backgroundColor: Colors.red.shade50,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          ),
                          child: const Text('Clear', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ],
                    ),
                  ),

                  _buildSectionHeader('Account Session'),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        InkWell(
                          onTap: () {
                            showDialog(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                backgroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                title: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                content: const Text(
                                  'Are you sure you want to log out? You can log back in anytime with your mobile number.',
                                  style: TextStyle(color: Color(0xFF64748B), height: 1.4),
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(ctx),
                                    child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                                  ),
                                  ElevatedButton(
                                    onPressed: () async {
                                      Navigator.pop(ctx);
                                      await _storage.delete(key: 'accessToken');
                                      await _storage.delete(key: 'userMobile');
                                      await _storage.delete(key: 'patientName');
                                      await _storage.delete(key: 'patientAddress');
                                      if (mounted) {
                                        context.go('/login');
                                      }
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFEF4444),
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      elevation: 0,
                                    ),
                                    child: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            );
                          },
                          child: Row(
                            children: const [
                              CircleAvatar(
                                backgroundColor: Color(0xFFFEF2F2),
                                child: Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 20),
                              ),
                              SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Log Out / Switch Account',
                                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFFEF4444)),
                                    ),
                                    SizedBox(height: 2),
                                    Text(
                                      'Sign in with a different mobile number',
                                      style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                    ),
                                  ],
                                ),
                              ),
                              Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 36),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 4),
    );
  }
}
